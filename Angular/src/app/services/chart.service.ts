import { Injectable } from '@angular/core';
import { Chart, registerables} from 'chart.js';
Chart.register(...registerables);

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  single(graphTitle: string, key: string, labels: any, data: any, context: string, charttype: any): any {
    var chart = new Chart(context, {
      type: charttype,
      data: {
        labels: labels,
        datasets: [{
          label: key,
          backgroundColor: [
            'rgb(255, 99, 60)',
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)',
            ],
            data: data
        }]
      },
      options: {

      }
    });
  }

  double(graphTitle: string, primaryDatasetKey: string, secondaryDatasetKey: string, labels: any, primaryDataset: any, secondaryDataset: any, context: string, charttype: any): any {
    var chart = new Chart(context, {
      type: charttype,
      data: {
        labels: labels,
        datasets: [
          {
            label: primaryDatasetKey,
            backgroundColor: [
              'rgb(31, 97, 141)',
            ],
            data: primaryDataset
          },
          {
            label: secondaryDatasetKey,
            backgroundColor: [
              'rgb(255, 99, 60)',
            ],
            data: secondaryDataset
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: graphTitle
          },
        },
        responsive: true,
        scales: {
          x: {stacked: true,},
          y: {stacked: true,},
        }
      }
    });
  }
}
