import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.deps import get_current_user
from app.models import Expense, User
from app.routers.categories import get_visible_category
from app.schemas import ExpenseCreate, ExpenseRead, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["expenses"])


async def get_owned_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Expense:
    result = await db.execute(
        select(Expense)
        .options(joinedload(Expense.category))
        .where(Expense.id == expense_id, Expense.user_id == current_user.id)
    )
    expense = result.scalar_one_or_none()
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return expense


@router.post("", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
async def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Expense:
    await get_visible_category(payload.category_id, current_user, db)

    expense = Expense(user_id=current_user.id, **payload.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense, attribute_names=["category"])
    return expense


@router.get("", response_model=list[ExpenseRead])
async def list_expenses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Expense]:
    result = await db.execute(
        select(Expense)
        .options(joinedload(Expense.category))
        .where(Expense.user_id == current_user.id)
        .order_by(Expense.date.desc(), Expense.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{expense_id}", response_model=ExpenseRead)
async def get_expense(expense: Expense = Depends(get_owned_expense)) -> Expense:
    return expense


@router.patch("/{expense_id}", response_model=ExpenseRead)
async def update_expense(
    payload: ExpenseUpdate,
    expense: Expense = Depends(get_owned_expense),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Expense:
    update_data = payload.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        await get_visible_category(update_data["category_id"], current_user, db)

    for field, value in update_data.items():
        setattr(expense, field, value)

    await db.commit()
    await db.refresh(expense, attribute_names=["category"])
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense: Expense = Depends(get_owned_expense),
    db: AsyncSession = Depends(get_db),
) -> None:
    await db.delete(expense)
    await db.commit()
