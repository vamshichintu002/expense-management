'use client'

import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CategorySelect } from '@/components/category-select'

// Expense type definition
type Expense = {
  id: string
  date: Date
  amount: number
  description: string
  paymentMode: string
  category: string
}

export function ExpenseManagerComponent() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(moment())
  const [category, setCategory] = useState('')

  // Function to add a new expense
  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    setExpenses([...expenses, { ...newExpense, id: uuidv4() }])
    setIsAddingExpense(false)
    setCategory('')
  }

  // Function to delete an expense
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  // Function to get expenses for a specific date
  const getExpensesForDate = (date: Date) => {
    return expenses.filter(expense => moment(expense.date).isSame(date, 'day'))
  }

  // Function to get monthly report data
  const getMonthlyReportData = () => {
    const monthlyData: { [key: string]: number } = {}
    expenses.forEach(expense => {
      const monthYear = moment(expense.date).format('MMM YYYY')
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + expense.amount
    })
    return Object.entries(monthlyData).map(([month, total]) => ({ month, total }))
  }

  // Function to generate calendar days
  const generateCalendarDays = () => {
    const startDay = currentMonth.clone().startOf('month').startOf('week')
    const endDay = currentMonth.clone().endOf('month').endOf('week')
    const days = []
    const day = startDay.clone()

    while (day.isSameOrBefore(endDay, 'day')) {
      days.push(day.clone())
      day.add(1, 'day')
    }

    return days
  }

  // Function to handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => prev.clone().add(direction === 'next' ? 1 : -1, 'month'))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Expense Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentMonth.format('MMMM YYYY')}</CardTitle>
              <div>
                <Button onClick={() => navigateMonth('prev')} className="mr-2">Previous</Button>
                <Button onClick={() => navigateMonth('next')}>Next</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-bold p-2">{day}</div>
              ))}
              {generateCalendarDays().map(day => (
                <div
                  key={day.format('YYYY-MM-DD')}
                  className={`p-2 border text-center cursor-pointer ${
                    day.isSame(selectedDate, 'day') ? 'bg-primary text-primary-foreground' : ''
                  } ${!day.isSame(currentMonth, 'month') ? 'text-muted-foreground' : ''}`}
                  onClick={() => setSelectedDate(day.toDate())}
                >
                  {day.format('D')}
                  {getExpensesForDate(day.toDate()).length > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">
              {moment(selectedDate).format('MMMM D, YYYY')}
            </h3>
            {getExpensesForDate(selectedDate).map(expense => (
              <div key={expense.id} className="mb-2 p-2 border rounded">
                <p>{expense.description} - ${expense.amount}</p>
                <p className="text-sm text-gray-500">Paid by: {expense.paymentMode}</p>
                <Button variant="destructive" size="sm" onClick={() => deleteExpense(expense.id)}>
                  Delete
                </Button>
              </div>
            ))}
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
              <DialogTrigger asChild>
                <Button className="mt-2">Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  addExpense({
                    date: selectedDate,
                    amount: parseFloat(formData.get('amount') as string),
                    description: formData.get('description') as string,
                    paymentMode: formData.get('paymentMode') as string,
                    category: category
                  })
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="paymentMode" className="text-right">
                        Payment Mode
                      </Label>
                      <Select name="paymentMode" defaultValue="cash">
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="debit">Debit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <div className="col-span-3">
                        <CategorySelect value={category} onChange={setCategory} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Save Expense</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyReportData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}