import React, { useState, useMemo } from 'react';
import { Table, Pagination } from 'react-bootstrap';
import { FiChevronUp, FiChevronDown, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from 'react-icons/fi';

const DataTable = ({
  columns,
  data,
  pageSize = 5,
  sortable = true,
  onRowClick = null,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const requestSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className={`data-table ${className}`}>
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  onClick={() => column.sortable !== false && requestSort(column.key)}
                  className={column.sortable !== false ? 'sortable' : ''}
                  style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
                >
                  <div className="d-flex align-items-center">
                    {column.header}
                    {sortable && column.sortable !== false && (
                      <span className="ms-1">
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <FiChevronUp size={16} />
                          ) : (
                            <FiChevronDown size={16} />
                          )
                        ) : (
                          <FiChevronUp size={16} style={{ opacity: 0.3 }} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column.key}`}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            Showing {Math.min((currentPage - 1) * pageSize + 1, data.length)} to{' '}
            {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
          </div>
          <Pagination className="mb-0">
            <Pagination.First 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
            >
              <FiChevronsLeft />
            </Pagination.First>
            <Pagination.Prev 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </Pagination.Prev>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage > totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Pagination.Item 
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </Pagination.Next>
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <FiChevronsRight />
            </Pagination.Last>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataTable;
