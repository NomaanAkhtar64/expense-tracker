import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import ExpenseCategory, User
from app.schemas import ExpenseCategoryCreate, ExpenseCategoryRead

router = APIRouter(prefix="/categories", tags=["categories"])


async def get_visible_category(
    category_id: uuid.UUID, current_user: User, db: AsyncSession
) -> ExpenseCategory:
    """A category is visible to a user if it's global (user_id IS NULL) or their own."""
    result = await db.execute(
        select(ExpenseCategory).where(
            ExpenseCategory.id == category_id,
            or_(
                ExpenseCategory.user_id.is_(None),
                ExpenseCategory.user_id == current_user.id,
            ),
        )
    )
    category = result.scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.get("", response_model=list[ExpenseCategoryRead])
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ExpenseCategory]:
    result = await db.execute(
        select(ExpenseCategory)
        .where(
            or_(
                ExpenseCategory.user_id.is_(None),
                ExpenseCategory.user_id == current_user.id,
            )
        )
        .order_by(ExpenseCategory.name)
    )
    return list(result.scalars().all())


@router.post("", response_model=ExpenseCategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: ExpenseCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExpenseCategory:
    # DB constraints only cover global-vs-global and own-vs-own name collisions
    # (see models.py), not "name matches a global category" - check that here so
    # a user can't end up with two identically-named categories in their own list.
    existing = await db.execute(
        select(ExpenseCategory).where(
            ExpenseCategory.name == payload.name,
            or_(
                ExpenseCategory.user_id.is_(None),
                ExpenseCategory.user_id == current_user.id,
            ),
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists"
        )

    category = ExpenseCategory(user_id=current_user.id, name=payload.name)
    db.add(category)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists"
        )
    await db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    # Scoped to the user's own categories (not just "visible" ones) - global
    # categories 404 here too, same as any other user's category would.
    result = await db.execute(
        select(ExpenseCategory).where(
            ExpenseCategory.id == category_id,
            ExpenseCategory.user_id == current_user.id,
        )
    )
    category = result.scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    try:
        await db.delete(category)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category is in use by one or more expenses",
        )
