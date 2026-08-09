import React, { useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { ImportResultMessageBar } from "@/components/ImportResultMessageBar";
import { Button } from "@/components/ui/button";
import { calculateHandicap } from "@/lib/utils";
import { COLUMN_HEADERS, CSV_HEADERS } from "@/lib/constants";
import { useFileImport } from "@/hooks/useFileImport";
import { ThemeProvider } from "@/providers/theme-provider";
import type { IEntry } from "@/types/IEntry";
import type { IFileImportResult } from "@/types/IFileImportResult";
import versionData from "@/version.json";
import { Download, Plus, Upload } from "lucide-react";
import { mockScores } from "@/mockData/mockScores";
import { EntryRow } from "@/components/EntryRow";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_KEY_OPTIONS, SORT_ORDER_OPTIONS } from "@/types/sort";
import { Label } from "@/components/ui/label";

const mockEntries: IEntry[] = mockScores;
const VERSION = `v1.0.${versionData.version}`;

const EMPTY_ENTRY = (): IEntry => ({
  id: crypto.randomUUID(),
  date: new Date(),
  courseName: "",
  courseRating: 0,
  slopeRating: 0,
  score: 0,
  isNineHole: false,
});

const createInitialEntries = (): IEntry[] => (window.location.hostname === "localhost" ? [...mockEntries] : [EMPTY_ENTRY()]);

export function App() {
  const [entries, setEntries] = React.useState<IEntry[]>(createInitialEntries);
  const [handicapVisible, setHandicapVisible] = React.useState(false);
  const [importResult, setImportResult] = React.useState<IFileImportResult | null>(null);
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleImport = React.useCallback((result: IFileImportResult) => {
    setImportResult(result);
    if (result.imported.length > 0) {
      setEntries(result.imported);
      setHandicapVisible(false);
    }
  }, []);

  const { fileInputRef, triggerFilePicker, handleFileChange } = useFileImport(handleImport);

  const exportData = () => {
    let csvContent = `${CSV_HEADERS.join(",")}\n`;
    for (const entry of entries) {
      // Fixed en-US M/D/YYYY format so exports always round-trip through parseFile, regardless of the user's locale.
      csvContent += `${entry.date.toLocaleDateString("en-US")},${entry.courseName.replaceAll(",", "")},${entry.courseRating},${entry.slopeRating},${entry.score},${entry.isNineHole ? "true" : "false"}\n`;
    }
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "golf-handicap-calculator-scores.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const columnHeaders = COLUMN_HEADERS;

  const getEligibleEntries = (): IEntry[] => entries.filter((e) => e.score > 0 && e.courseRating > 0 && e.slopeRating > 0);

  const newEntry = () => {
    setEntries((prev) => [...prev, EMPTY_ENTRY()]);
  };

  const updateEntry = <K extends keyof IEntry>(id: string, field: K, value: IEntry[K]) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    setHandicapVisible(false);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <div className="inline-flex min-h-screen w-full flex-col bg-app-background text-app-foreground">
        <header className="flex min-h-12.5 w-full items-center justify-between bg-primary px-3 text-primary-foreground">
          <h1 className="text-base font-semibold sm:text-xl">Golf Handicap Calculator</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Import CSV"
              onClick={triggerFilePicker}
              className="h-10 sm:w-auto sm:min-w-35 sm:gap-1.5 sm:px-2.5"
            >
              <Upload />
              <span className="hidden sm:inline">Import CSV</span>
            </Button>
            <Button
              size="icon"
              aria-label="Add Entry"
              onClick={() => {
                newEntry();
                setHandicapVisible(false);
              }}
              className="h-10 border border-white hover:font-bold sm:w-auto sm:min-w-35 sm:gap-1.5 sm:px-2.5"
            >
              <Plus />
              <span className="hidden sm:inline">Add Entry</span>
            </Button>
            <ModeToggle />
          </div>
        </header>

        {importResult && (
          <ImportResultMessageBar
            importedCount={importResult.imported.length}
            skipped={importResult.skipped}
            onDismiss={() => setImportResult(null)}
          />
        )}

        <main className="flex flex-1 flex-col overflow-y-auto px-2 py-2">
          <section className="mb-5 px-2">
            <p className="p-2 text-lg font-semibold">To get started, add at least one entry, then click "Calculate Handicap".</p>
            <p className="mb-5 p-2">
              This handicap calculator is different than most since it allows you to calculate your handicap with just{" "}
              <u>
                <i>
                  <b>one</b>
                </i>
              </u>{" "}
              score, but the handicap will be more accurate if you add more scores.
              <br />
              <br />
              If you have at least 3 scores, the calculator removes your highest and lowest scores, then averages the handicap differential of the
              remaining scores to determine your handicap index.
              <br />
              <br />
              The formula for handicap differential is <strong>(Score - Course Rating) * 113 / Slope Rating</strong>. Your handicap index is rounded
              to one decimal place.
            </p>
          </section>

          <div className="flex h-[60px] items-center gap-4 rounded-lg border border-foreground bg-gray-400 px-2">
            <Label className="text-muted">
              Sort By
              <Select items={SORT_KEY_OPTIONS} value={sortKey} onValueChange={(v) => setSortKey(v ?? "date")}>
                <SelectTrigger className="w-[150px] bg-muted! text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(SORT_KEY_OPTIONS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
            <Label className="text-muted">
              Sort Order
              <Select items={SORT_ORDER_OPTIONS} value={sortOrder} onValueChange={(v) => setSortOrder(v ?? "asc")}>
                <SelectTrigger className="w-[150px] bg-muted! text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(SORT_ORDER_OPTIONS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          </div>

          <section className="flex flex-1 flex-col">
            <div className="hidden w-full flex-row gap-10 px-1 py-1 sm:flex">
              <div className="w-10 min-w-10 shrink-0" />
              {columnHeaders.map((header) => (
                <span key={header} className="flex-1 p-1 text-center font-semibold">
                  {header}
                </span>
              ))}
            </div>

            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onUpdate={updateEntry}
                onRemove={removeEntry}
                onResetHandicap={() => setHandicapVisible(false)}
              />
            ))}

            <div className="flex flex-col items-center py-3">
              <button
                type="button"
                disabled={getEligibleEntries().length < 1}
                onClick={() => setHandicapVisible(true)}
                className="min-w-50 rounded bg-primary px-4 py-2 text-primary-foreground disabled:bg-[#d9d9d9] disabled:text-[#a9a9a9] disabled:opacity-50"
                aria-label="Calculate Handicap"
              >
                Calculate Handicap
              </button>
            </div>

            {handicapVisible ? (
              <div className="px-2 py-3">
                <p className="text-lg font-semibold text-app-foreground">Your Handicap: {calculateHandicap(getEligibleEntries())}</p>
                <button
                  type="button"
                  onClick={exportData}
                  title="Download your scores so they can be re-imported to the tool at a later date."
                  className="mt-3 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:opacity-90 active:translate-y-px"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </button>
              </div>
            ) : null}
          </section>
        </main>

        <footer className="flex min-h-12.5 w-full items-center bg-primary">
          <p className="ml-auto pr-2 text-base leading-none text-primary-foreground">{VERSION}</p>
        </footer>
      </div>
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} aria-label="CSV file input" />
    </ThemeProvider>
  );
}
