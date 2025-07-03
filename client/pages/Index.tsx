import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Languages,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

type TranslationStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

interface TranslationState {
  status: TranslationStatus;
  fileName?: string;
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export default function Index() {
  const [translation, setTranslation] = useState<TranslationState>({
    status: "idle",
    progress: 0,
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setTranslation({
      status: "uploading",
      fileName: file.name,
      progress: 25,
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTranslation((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 15, 85),
        }));
      }, 500);

      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/translate-pdf", {
        method: "POST",
        body: await file.arrayBuffer(),
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        setTranslation({
          status: "completed",
          fileName: file.name,
          progress: 100,
          downloadUrl,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Translation failed");
      }
    } catch (error) {
      setTranslation({
        status: "error",
        fileName: file.name,
        progress: 0,
        error: error instanceof Error ? error.message : "Translation failed",
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled:
      translation.status === "uploading" || translation.status === "processing",
  });

  const resetTranslation = () => {
    setTranslation({ status: "idle", progress: 0 });
  };

  const downloadFile = () => {
    if (translation.downloadUrl) {
      const link = document.createElement("a");
      link.href = translation.downloadUrl;
      link.download = `translated-${translation.fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  PDFTranslate
                </h1>
                <p className="text-sm text-muted-foreground">
                  Powered by DeepL AI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Translate PDFs to French
            <span className="block text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">
              Instantly & Accurately
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Upload your PDF document and get a professionally translated version
            in French, with layout, headers, footers, and hyperlinks preserved.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 rounded-xl border border-purple-100">
              <Zap className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-slate-700">Lightning Fast</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 rounded-xl border border-purple-100">
              <Globe className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-slate-700">
                Layout Preserved
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 rounded-xl border border-purple-100">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="font-medium text-slate-700">100% Secure</span>
            </div>
          </div>
        </div>

        {/* Main Translation Interface */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-purple-200 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-800">
                Upload Your PDF
              </CardTitle>
              <CardDescription className="text-base">
                Drop your PDF file here or click to browse. Maximum file size:
                50MB
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Upload Area */}
              {translation.status === "idle" && (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                    ${
                      isDragActive
                        ? "border-purple-400 bg-purple-50 scale-105"
                        : "border-purple-200 hover:border-purple-300 hover:bg-purple-25"
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-2">
                    {isDragActive
                      ? "Drop your PDF here!"
                      : "Drag & drop your PDF here"}
                  </p>
                  <p className="text-slate-500">or click to select a file</p>
                  <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Choose File
                  </Button>
                </div>
              )}

              {/* Processing States */}
              {(translation.status === "uploading" ||
                translation.status === "processing") && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-medium text-slate-800">
                        {translation.fileName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {translation.status === "uploading"
                          ? "Uploading and processing..."
                          : "Translating..."}
                      </p>
                    </div>
                  </div>
                  <Progress value={translation.progress} className="w-full" />
                  <p className="text-sm text-slate-600">
                    This may take a few moments depending on document size
                  </p>
                </div>
              )}

              {/* Success State */}
              {translation.status === "completed" && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      Translation Complete!
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Your PDF has been successfully translated to French.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={downloadFile}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Translated PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetTranslation}
                        className="border-purple-200 hover:bg-purple-50"
                      >
                        Translate Another File
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {translation.status === "error" && (
                <div className="text-center space-y-4">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      Translation Failed
                    </h3>
                    <p className="text-red-600 mb-4">{translation.error}</p>
                    <Button
                      variant="outline"
                      onClick={resetTranslation}
                      className="border-red-200 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-slate-800 mb-6">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800">1. Upload</h4>
              <p className="text-slate-600 text-sm">
                Upload your PDF document securely to our servers
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800">2. Translate</h4>
              <p className="text-slate-600 text-sm">
                Our AI extracts and translates your content using DeepL
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800">3. Download</h4>
              <p className="text-slate-600 text-sm">
                Get your translated PDF with original formatting preserved
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white/60 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-slate-600">
            © 2024 PDFTranslate. Powered by DeepL API. Your documents are
            processed securely and not stored.
          </p>
        </div>
      </footer>
    </div>
  );
}
