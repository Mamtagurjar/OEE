import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';

export interface SearchableDropdownOption {
  label: string;
  value: string;
}

interface SearchableDropdownProps {
  value: string;
  options: SearchableDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  ariaLabel = 'Select option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value) ?? null;

  const filteredOptions = useMemo(() => options, [options]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
  }, [isOpen]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="searchable-dropdown" ref={rootRef}>
      <button
        type="button"
        className={`searchable-dropdown__trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="searchable-dropdown__trigger-text">
          {selectedOption?.label ?? placeholder}
        </span>
        <IonIcon icon={chevronDownOutline} className="searchable-dropdown__trigger-icon" />
      </button>

      {isOpen ? (
        <div className="searchable-dropdown__menu">
          <div className="searchable-dropdown__options" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`searchable-dropdown__option ${
                    option.value === value ? 'is-selected' : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="searchable-dropdown__empty">No results found</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchableDropdown;
