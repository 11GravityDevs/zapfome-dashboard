"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { Toggle } from "@/components/toggle";

import { formatCurrency } from "@/lib/format";
import type { MenuItemFlavor } from "@/lib/types/database";
import { NewFlavorModal } from "./new-flavor-modal";
import type { MenuItemWithFlavors } from "./page";

type MenuItemRowProps = {
  item: MenuItemWithFlavors;
  showDivider: boolean;
  onToggleAvailability: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFlavorToggle: (flavor: MenuItemFlavor) => void;
  onFlavorAdd: (itemId: string, name: string) => Promise<void>;
  onFlavorRemove: (flavor: MenuItemFlavor) => void;
};

export function MenuItemRow({
  item,
  showDivider,
  onToggleAvailability,
  onEdit,
  onDelete,
  onFlavorToggle,
  onFlavorAdd,
  onFlavorRemove,
}: MenuItemRowProps) {
  const [flavorModalOpen, setFlavorModalOpen] = useState(false);

  return (
    <div>
      {showDivider && <div className="border-t border-border-light" />}
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-font-primary">{item.name}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-font-secondary">{item.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-base font-bold text-font-primary">
                {formatCurrency(item.price)}
              </span>
              <Toggle
                checked={item.is_available}
                onCheckedChange={onToggleAvailability}
                label={item.is_available ? "Desativar item" : "Ativar item"}
              />
              <Button variant="text" onClick={onEdit}>
                Editar
              </Button>
              <button
                type="button"
                onClick={onDelete}
                className="cursor-pointer rounded-md p-2 text-font-secondary transition-colors hover:bg-bg-hover hover:text-accent-red"
                aria-label={`Excluir ${item.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {item.allows_flavors && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-font-secondary">Sabores disponíveis</p>
              <div className="flex flex-col">
                {item.menu_item_flavor.map((flavor) => (
                  <div
                    key={flavor.id}
                    className="flex items-center justify-between border-t border-border-light py-2 pl-4"
                  >
                    <span className="text-sm text-font-primary">{flavor.name}</span>
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={flavor.is_available}
                        onCheckedChange={() => onFlavorToggle(flavor)}
                        label={flavor.is_available ? "Desativar sabor" : "Ativar sabor"}
                      />
                      <button
                        type="button"
                        onClick={() => onFlavorRemove(flavor)}
                        className="cursor-pointer rounded-md p-2 text-font-secondary transition-colors hover:bg-bg-hover hover:text-accent-red"
                        aria-label={`Remover ${flavor.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="text"
                  leadingIcon={<Plus size={14} />}
                  className="mt-1 self-center"
                  onClick={() => setFlavorModalOpen(true)}
                >
                  Adicionar sabor
                </Button>

                <NewFlavorModal
                  open={flavorModalOpen}
                  onClose={() => setFlavorModalOpen(false)}
                  existingFlavors={item.menu_item_flavor.map((f) => f.name)}
                  onConfirm={async (name) => {
                    await onFlavorAdd(item.id, name);
                    setFlavorModalOpen(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
