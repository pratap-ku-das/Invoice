import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { TableSkeleton } from './feedback';
import { cn } from '@/lib/utils';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  loading?: boolean;
  page?: number;
  pages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  sort?: string;
  order?: 'asc' | 'desc';
  onSortChange?: (sort: string, order: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  loading,
  page = 1,
  pages = 1,
  total = 0,
  onPageChange,
  sort,
  order,
  onSortChange,
  onRowClick,
  empty,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-wider text-slate-400 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const id = header.column.id;
                  const sortable = header.column.columnDef.enableSorting !== false && onSortChange;
                  return (
                    <th
                      key={header.id}
                      className={cn('whitespace-nowrap px-4 py-3 font-medium', sortable && 'cursor-pointer select-none')}
                      onClick={
                        sortable
                          ? () => onSortChange!(id, sort === id && order === 'asc' ? 'desc' : 'asc')
                          : undefined
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <TableSkeleton cols={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{empty ?? <div className="p-10 text-center text-slate-400">No records found</div>}</td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && pages > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">
            {total.toLocaleString('en-IN')} records · page {page} of {pages}
          </span>
          <div className="flex gap-1">
            <button
              className="btn-outline px-2 py-1"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="btn-outline px-2 py-1"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
