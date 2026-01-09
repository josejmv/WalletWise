import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450.00</div>
              <p className="text-xs text-muted-foreground">
                +2.5% vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos del Mes
              </CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">$4,200.00</div>
              <p className="text-xs text-muted-foreground">
                2 ingresos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gastos del Mes
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                $2,150.00
              </div>
              <p className="text-xs text-muted-foreground">
                15 gastos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ahorro</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48.8%</div>
              <p className="text-xs text-muted-foreground">
                $2,050.00 ahorrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts placeholder */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
              <CardDescription>
                Ingresos vs Gastos de los ultimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Grafico de tendencia (Recharts)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>Distribucion del mes actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Grafico de dona (Recharts)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent transactions & Budgets */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>Ultimos movimientos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Netflix",
                    amount: -15.99,
                    category: "Entretenimiento",
                  },
                  { name: "Salario", amount: 3500, category: "Trabajo" },
                  { name: "Supermercado", amount: -120.5, category: "Comida" },
                  { name: "Freelance", amount: 700, category: "Trabajo" },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tx.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium ${tx.amount > 0 ? "text-success" : "text-destructive"}`}
                    >
                      {tx.amount > 0 ? "+" : ""}$
                      {Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progreso de Metas</CardTitle>
              <CardDescription>Tus metas de ahorro activas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Vacaciones 2024", current: 1350, target: 3000 },
                  { name: "Fondo Emergencia", current: 4500, target: 5000 },
                  { name: "Laptop Nueva", current: 800, target: 1500 },
                ].map((goal, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-muted-foreground">
                        ${goal.current} / ${goal.target}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${(goal.current / goal.target) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
