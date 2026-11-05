import { IoSearch, IoFunnel } from 'react-icons/io5';
import './SearchFilter.css';

const SearchFilter = ({ searchValue, onSearchChange, placeholder = 'Search...', filters = [], activeFilters = {}, onFilterChange }) => {
  return (
    <div className="search-filter-bar">
      <div className="search-box">
        <IoSearch className="search-icon" />
        <input type="text" placeholder={placeholder} value={searchValue} onChange={e => onSearchChange(e.target.value)} className="search-input" />
      </div>
      {filters.length > 0 && (
        <div className="filter-group">
          <IoFunnel className="filter-icon" />
          {filters.map(filter => (
            <select key={filter.value} value={activeFilters[filter.value] || ''} onChange={e => onFilterChange(filter.value, e.target.value)} className="filter-select">
              <option value="">{filter.label}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
