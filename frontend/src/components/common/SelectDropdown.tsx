import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, Loader2 } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  code?: string;
}

export type DropdownOptionItem =
  | SelectOption
  | { id: number | string; name: string; code?: string }
  | { value: number | string; label: string; code?: string }
  | Record<string, any>;

export interface SelectDropdownProps {
  label?: string;
  name?: string;
  value?: string | number | null;
  options: DropdownOptionItem[];
  onChange: (value: string | number) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  required?: boolean;
  isSearchable?: boolean;
  className?: string;
  helperText?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  name,
  value,
  options = [],
  onChange,
  onBlur,
  placeholder = "Select an option",
  error,
  disabled = false,
  isLoading = false,
  required = false,
  isSearchable = true,
  className = "",
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options array to standard { value, label, code } format
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt: any) => {
      if (typeof opt === "object" && opt !== null) {
        if ("value" in opt && "label" in opt) {
          return opt as SelectOption;
        }
        if ("id" in opt && "name" in opt) {
          return {
            value: opt.id,
            label: opt.name,
            code: opt.code,
          };
        }
      }
      return { value: String(opt), label: String(opt) };
    });
  }, [options]);

  // Selected Option finding
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value) && value !== null && value !== undefined && value !== ""
  );

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const term = searchTerm.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.code && opt.code.toLowerCase().includes(term))
    );
  }, [normalizedOptions, searchTerm]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchable]);

  const toggleDropdown = () => {
    if (disabled || isLoading) return;
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setSearchTerm("");
    }
  };

  const handleSelectOption = (optValue: string | number) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleBlurContainer = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.relatedTarget as Node)
    ) {
      if (onBlur) {
        onBlur(e);
      }
    }
  };

  return (
    <div
      ref={dropdownRef}
      onBlur={handleBlurContainer}
      tabIndex={-1}
      className={`space-y-1.5 relative focus:outline-hidden ${className}`}
    >
      {label && (
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {/* Select Box Button */}
      <button
        type="button"
        name={name}
        onClick={toggleDropdown}
        disabled={disabled || isLoading}
        className={`w-full h-10 px-3 py-2 text-xs text-left bg-white rounded-lg border transition-all flex items-center justify-between shadow-xs ${
          error
            ? "border-red-500 ring-2 ring-red-100"
            : isOpen
            ? "border-teal-600 ring-2 ring-teal-100"
            : "border-slate-300 hover:border-slate-400"
        } ${
          disabled || isLoading
            ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
            : "cursor-pointer"
        }`}
      >
        <span className="truncate">
          {isLoading ? (
            <span className="text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
              Loading options...
            </span>
          ) : selectedOption ? (
            <span className="text-slate-900 font-medium flex items-center gap-1.5">
              {selectedOption.label}
              {selectedOption.code && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono">
                  {selectedOption.code}
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-teal-600" : ""
          }`}
        />
      </button>

      {/* Helper & Error messages */}
      {error ? (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      ) : (
        helperText && <p className="text-[11px] text-slate-500">{helperText}</p>
      )}

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar inside dropdown */}
          {isSearchable && normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto p-1 space-y-0.5 max-h-48 scrollbar-thin">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`w-full px-3 py-2 text-xs rounded-md text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-teal-50 text-teal-900 font-bold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.code && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                          {opt.code}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
