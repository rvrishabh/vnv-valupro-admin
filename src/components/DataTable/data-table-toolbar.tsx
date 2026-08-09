import { debounce } from 'lodash'
import { X } from 'lucide-react'

import type { Table } from '@tanstack/react-table'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    filters?: Array<{
        columnName: string
        title: string
        options: { label: string; value: string }[]
    }>
}

export function DataTableToolbar<TData>({ table, filters }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getPreFilteredRowModel().rows.length > table.getFilteredRowModel().rows.length

    const handleSearch = debounce(table.setGlobalFilter, 500)

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center flex-1 space-x-2">
                <Input
                    placeholder="Search items..."
                    onChange={(event) => {
                        handleSearch(event?.target?.value)
                    }}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {filters?.map(({ columnName, title, options }) => (
                    <DataTableFacetedFilter
                        key={columnName}
                        column={table.getColumn(columnName)}
                        title={title}
                        options={options}
                    />
                ))}
                {isFiltered && (
                    <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
                        Reset
                        <X className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    )
}
