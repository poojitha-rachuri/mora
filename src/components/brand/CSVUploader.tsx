"use client";
import { useState, useCallback } from "react";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CSVUploaderProps {
  onParsed: (rows: Record<string, string>[], file: File) => void;
  onError: (message: string) => void;
}

const REQUIRED_COLUMNS = ["mobile_number"];
const RINGG_VARIABLES = [
  { column: "mobile_number", variable: "{{mobile_number}}", required: true },
  { column: "name", variable: "{{name}}", required: false },
  { column: "product_name", variable: "{{product_name}}", required: false },
  { column: "product_category", variable: "{{product_category}}", required: false },
  { column: "product_subcategory", variable: "{{product_subcategory}}", required: false },
  { column: "purchase_date", variable: "{{purchase_date}}", required: false },
  { column: "order_id", variable: "{{order_id}}", required: false },
  { column: "city", variable: "{{city}}", required: false },
  { column: "skin_type", variable: "{{skin_type}}", required: false },
  { column: "brand_name", variable: "{{brand_name}}", required: false },
];

export default function CSVUploader({ onParsed, onError }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        onError("Please upload a CSV file");
        return;
      }

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.data.length === 0) {
            onError("CSV file is empty");
            return;
          }

          const cols = Object.keys(result.data[0]);
          const missingRequired = REQUIRED_COLUMNS.filter((c) => !cols.includes(c));
          if (missingRequired.length > 0) {
            onError(`Required column '${missingRequired[0]}' not found in CSV`);
            return;
          }

          setColumns(cols);
          setPreview(result.data.slice(0, 5));
          setFileName(file.name);
          onParsed(result.data, file);
        },
        error: (err) => onError(`CSV parse error: ${err.message}`),
      });
    },
    [onParsed, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:border-slate-300"
        }`}
        onClick={() => document.getElementById("csv-input")?.click()}
      >
        <div className="text-4xl mb-2">📋</div>
        <p className="text-sm font-medium text-slate-700">
          {fileName ? `✓ ${fileName}` : "Drop your buyer CSV here"}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Required column: mobile_number
        </p>
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Column mapping preview */}
      {columns.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Ringg.ai Variable Mapping
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {RINGG_VARIABLES.map((v) => (
              <div
                key={v.variable}
                className={`text-xs px-2 py-1 rounded-md border ${
                  columns.includes(v.column)
                    ? "bg-green-50 border-green-200 text-green-700"
                    : v.required
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                {v.variable} {columns.includes(v.column) ? "✓" : v.required ? "✗ missing" : "—"}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row preview table */}
      {preview.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Preview ({preview.length} of {preview.length}+ rows)
          </p>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.slice(0, 6).map((col) => (
                    <TableHead key={col} className="text-xs">{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, i) => (
                  <TableRow key={i}>
                    {columns.slice(0, 6).map((col) => (
                      <TableCell key={col} className="text-xs">
                        {row[col] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
