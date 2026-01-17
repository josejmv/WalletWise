"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IncomeForm } from "@/app/dashboard/incomes/_components/income-form";
import { ExpenseForm } from "@/app/dashboard/expenses/_components/expense-form";
import { TransferForm } from "@/app/dashboard/transfers/_components/transfer-form";
import { ConsumeModal } from "@/components/inventory/consume-modal";

// Added consume action type
type ActionType = "income" | "expense" | "transfer" | "consume" | null;

export function QuickActions() {
  const [activeModal, setActiveModal] = useState<ActionType>(null);
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    setActiveModal(null);
    // Invalidate dashboard data to refresh KPIs and recent transactions
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  const handleCancel = () => {
    setActiveModal(null);
  };

  const actions = [
    {
      type: "income" as const,
      label: "Ingreso",
      icon: ArrowDownCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10 hover:bg-green-500/20",
    },
    {
      type: "expense" as const,
      label: "Gasto",
      icon: ArrowUpCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10 hover:bg-red-500/20",
    },
    {
      type: "transfer" as const,
      label: "Transferencia",
      icon: ArrowLeftRight,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    // Consume action for inventory
    {
      type: "consume" as const,
      label: "Consumo",
      icon: ShoppingCart,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Acciones Rapidas
          </CardTitle>
          <CardDescription>Registra transacciones rapidamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {actions.map((action) => (
              <Button
                key={action.type}
                variant="ghost"
                className={`flex flex-col gap-2 h-auto py-4 ${action.bgColor}`}
                onClick={() => setActiveModal(action.type)}
              >
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Income Modal */}
      <Dialog
        open={activeModal === "income"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-green-500" />
              Registrar Ingreso
            </DialogTitle>
          </DialogHeader>
          <IncomeForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </DialogContent>
      </Dialog>

      {/* Expense Modal */}
      <Dialog
        open={activeModal === "expense"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-red-500" />
              Registrar Gasto
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog
        open={activeModal === "transfer"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-blue-500" />
              Registrar Transferencia
            </DialogTitle>
          </DialogHeader>
          <TransferForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </DialogContent>
      </Dialog>

      {/* v1.4.0: Consume Modal */}
      <ConsumeModal
        open={activeModal === "consume"}
        onOpenChange={(open) => setActiveModal(open ? "consume" : null)}
      />
    </>
  );
}
