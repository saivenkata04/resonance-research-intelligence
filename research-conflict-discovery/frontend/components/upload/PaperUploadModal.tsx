"use client";

import React, { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Paper } from "@/types";
import { uploadPaper } from "@/lib/api-client";

interface PaperUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newPaper: Paper) => void;
}

export const PaperUploadModal: React.FC<PaperUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF documents are supported for scientific paper ingestion.");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setErrorMsg("File exceeds the maximum limit of 30MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleStartIngestion = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgressPercent(20);
    setProgressStage("Uploading PDF & verifying cryptographic checksum...");

    try {
      const stageTimer1 = setTimeout(() => {
        setProgressPercent(50);
        setProgressStage("Parsing sections, tables & scientific methodology...");
      }, 700);

      const stageTimer2 = setTimeout(() => {
        setProgressPercent(85);
        setProgressStage("Extracting hyperparameters, metrics & evidence citations...");
      }, 1400);

      const realPaper = await uploadPaper(selectedFile);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      setProgressPercent(100);
      setProgressStage("Extraction completed successfully!");
      setTimeout(() => {
        setIsProcessing(false);
        onUploadSuccess(realPaper);
        onClose();
      }, 400);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || "Failed to parse and extract scientific paper. Ensure file is a valid PDF.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#DCE4EE] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-[#101827] text-white flex items-center justify-between border-b border-[#1f2d44]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#36C9C0]/20 flex items-center justify-center text-[#36C9C0]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ingest Scientific Paper</h3>
              <p className="text-xs text-slate-400">PDF parsing, section chunking & attribute extraction</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!isProcessing ? (
            <>
              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
                  dragActive
                    ? "border-[#36C9C0] bg-[#36C9C0]/10"
                    : "border-slate-300 hover:border-[#36C9C0] hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                  <FileText className="w-6 h-6 text-[#36C9C0]" />
                </div>

                <p className="text-sm font-semibold text-[#101827]">
                  {selectedFile ? selectedFile.name : "Click to select or drag and drop paper PDF"}
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  Supported formats: PDF (Maximum file size 30MB)
                </p>
              </div>

              {selectedFile && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-800 truncate">
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-xs text-rose-600 hover:underline shrink-0 ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          ) : (
            /* Processing State */
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#36C9C0]/15 flex items-center justify-center text-[#249e97] animate-pulse">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#101827]">Analyzing Document Pipeline</h4>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">{progressStage}</p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#36C9C0] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">{progressPercent}% Completed</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isProcessing && (
          <div className="p-4 bg-slate-50 border-t border-[#DCE4EE] flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedFile}
              onClick={handleStartIngestion}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#101827] bg-[#36C9C0] hover:bg-[#2db4ac] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Extract & Ingest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
