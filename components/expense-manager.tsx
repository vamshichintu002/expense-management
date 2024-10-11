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
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Expense Manager</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <CardTitle className="mb-2 sm:mb-0">{currentMonth.format('MMMM YYYY')}</CardTitle>
              <div className="flex space-x-2">
                <Button onClick={() => navigateMonth('prev')} size="sm">Previous</Button>
                <Button onClick={() => navigateMonth('next')} size="sm">Next</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-sm md:text-base">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-bold p-1 md:p-2">{day}</div>
              ))}
              {generateCalendarDays().map(day => (
                <div
                  key={day.format('YYYY-MM-DD')}
                  className={`p-1 md:p-2 border text-center cursor-pointer ${
                    day.isSame(selectedDate, 'day') ? 'bg-primary text-primary-foreground' : ''
                  } ${!day.isSame(currentMonth, 'month') ? 'text-muted-foreground' : ''}`}
                  onClick={() => setSelectedDate(day.toDate())}
                >
                  {day.format('D')}
                  {getExpensesForDate(day.toDate()).length > 0 && (
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Daily Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">
              {moment(selectedDate).format('MMMM D, YYYY')}
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
              {getExpensesForDate(selectedDate).map(expense => (
                <div key={expense.id} className="p-3 border rounded shadow-sm">
                  <p className="font-semibold">{expense.description} - ${expense.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Paid by: {expense.paymentMode}</p>
                  <p className="text-sm text-gray-500">Category: {expense.category}</p>
                  <Button variant="destructive" size="sm" onClick={() => deleteExpense(expense.id)} className="mt-2">
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
              <DialogTrigger asChild>
                <Button className="w-full">Add Expense</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlyReportData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}