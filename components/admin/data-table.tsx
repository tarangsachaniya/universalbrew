"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Column<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  total,
  page = 1,
  limit = 20,
  onPageChange,
}: DataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / limit) : 1

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}