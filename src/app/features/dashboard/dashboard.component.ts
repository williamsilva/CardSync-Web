import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, ChartModule, CardModule, TableModule],
})
export class DashboardComponent {
  today = new Date();

  stats = signal([
    { label: 'Transações', value: '12.432', icon: 'pi pi-wallet', color: '#6366f1' },
    { label: 'Conciliações', value: '9.876', icon: 'pi pi-check-circle', color: '#22c55e' },
    { label: 'Pendentes', value: '423', icon: 'pi pi-clock', color: '#f59e0b' },
    { label: 'Diferenças', value: '37', icon: 'pi pi-exclamation-triangle', color: '#ef4444' },
  ]);

  chartData = signal({
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Conciliações',
        data: [120, 190, 300, 250, 210, 160, 140],
        borderColor: '#3b82f6',
        tension: 0.4,
      },
    ],
  });

  chartOptions = signal({
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  });

  activities = signal([
    { user: 'Maria', action: 'Importou arquivo CNAB', time: '10:23' },
    { user: 'Carlos', action: 'Executou reconciliação', time: '09:52' },
    { user: 'Ana', action: 'Ajustou diferença manual', time: '09:30' },
    { user: 'Roberto', action: 'Importou extrato bancário', time: '08:41' },
  ]);
}
