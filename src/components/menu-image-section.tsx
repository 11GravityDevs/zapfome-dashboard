"use client";

import { useRef } from "react";
import Image from "next/image";
import { FileText, ImageIcon, Plus, Trash } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Spinner } from "@/components/spinner";
import { useToast } from "@/contexts/toast-context";
import { createClient } from "@/lib/supabase/client";
import { getFileNameFromUrl, getMenuMediaType } from "@/lib/utils/menu";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ACCEPTED_TYPES = "image/*,application/pdf";

type Props = {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  uploading: boolean;
  onUploadingChange: (v: boolean) => void;
  error?: string;
};

export function MenuImageSection({ imageUrls, onChange, uploading, onUploadingChange, error }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_FILES - imageUrls.length;
    if (files.length > remaining) {
      showToast({
        variant: "error",
        title: `Você pode adicionar no máximo ${remaining} arquivo${remaining === 1 ? "" : "s"}.`,
      });
      resetInput();
      return;
    }

    for (const file of Array.from(files)) {
      if (!isAcceptedType(file)) {
        showToast({
          variant: "error",
          title: `"${file.name}" não é um formato suportado. Envie imagens ou PDF.`,
        });
        resetInput();
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast({ variant: "error", title: `"${file.name}" excede o limite de 100 MB.` });
        resetInput();
        return;
      }
    }

    onUploadingChange(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({ variant: "error", title: "Sessão expirada. Faça login novamente." });
        onUploadingChange(false);
        return;
      }

      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        const path = `${user.id}/${crypto.randomUUID()}/${file.name}`;
        const { error } = await supabase.storage.from("menu-images").upload(path, file);

        if (error) {
          showToast({ variant: "error", title: `Erro ao enviar "${file.name}".` });
          continue;
        }

        const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }

      if (newUrls.length > 0) {
        onChange([...imageUrls, ...newUrls]);
      }
    } catch {
      showToast({ variant: "error", title: "Erro ao enviar arquivos. Tente novamente." });
    } finally {
      onUploadingChange(false);
      resetInput();
    }
  }

  function removeImage(index: number) {
    onChange(imageUrls.filter((_, i) => i !== index));
  }

  function resetInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <Card>
      <div className="flex items-center gap-(--spacing-sm) mb-(--spacing-xs)">
        <ImageIcon size={20} className="text-brand-primary" />
        <h2 className="text-lg font-semibold text-font-primary">Arquivos do cardápio</h2>
      </div>

      <p className="text-sm text-font-secondary mb-(--spacing-md)">
        Envie até {MAX_FILES} fotos ou PDFs do seu cardápio. Mínimo 1 arquivo. Tamanho máximo: 100 MB por arquivo.
      </p>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-(--spacing-md) mb-(--spacing-md)">
          {imageUrls.map((url, i) => {
            const isPdf = getMenuMediaType(url) === "pdf";
            return (
              <div key={url} className="relative aspect-square rounded-md border border-border overflow-hidden">
                {isPdf ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-(--spacing-xs) bg-bg-secondary p-(--spacing-sm) hover:bg-bg-hover transition-colors"
                    aria-label={`Abrir ${getFileNameFromUrl(url)}`}
                  >
                    <FileText size={48} className="text-brand-primary" />
                    <span className="text-xs text-font-secondary truncate max-w-full">
                      {getFileNameFromUrl(url)}
                    </span>
                  </a>
                ) : (
                  <Image src={url} alt={`Imagem do cardápio ${i + 1}`} fill className="object-cover" unoptimized />
                )}
                <Button
                  variant="red"
                  size="sm"
                  className="absolute top-1 right-1 size-8! min-w-0! p-0!"
                  aria-label={`Remover arquivo ${i + 1}`}
                  onClick={() => removeImage(i)}
                >
                  <Trash size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <div className="flex items-center gap-(--spacing-sm)">
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<Plus size={16} />}
          disabled={imageUrls.length >= MAX_FILES || uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          Adicionar arquivo
        </Button>

        {uploading && <Spinner size="sm" />}
      </div>

      {error && <p data-field-error className="text-xs font-medium text-accent-red mt-(--spacing-xs)">{error}</p>}
    </Card>
  );
}

function isAcceptedType(file: File): boolean {
  return file.type.startsWith("image/") || file.type === "application/pdf";
}
