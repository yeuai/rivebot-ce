import { Component, OnInit } from '@angular/core';
import { PhieuInService } from '@app/services/common/phieu-in.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public model = '';
  constructor(
    private logger: NGXLogger,
    private modalService: NgbModal,
    private svPhieuIn: PhieuInService,
  ) { }
  public myModel = '';
  // public mask = [/\d/, /\d/, ' ', 'g', 'i', 'ờ', ' ', /\d/, /\d/, ' phút, ngày '
  // , /\d/, /\d/, ' tháng ', /\d/, /\d/, ' năm ', /\d/, /\d/, /\d/, /\d/];
  public mask = [/\d/, /\d/, ' ', 'g', 'i', 'ờ', ' ', /\d/, /\d/, ' ', 'p', 'h', 'ú', 't', ',', ' ', 'n',
   'g', 'à', 'y', ' ', /\d/ , /\d/, ' ', 't', 'h', 'á', 'n', 'g', ' ', /\d/, /\d/, ' ', 'n', 'ă', 'm', ' '];
    // lineChart
  public lineChartData: Array<any> = [
    {data: [975, 885, 1200, 1215, 840, 825, 600], label: 'Khám bệnh nội trú'},
    {data: [420, 720, 600, 285, 1290, 405, 1350], label: 'Khám bệnh ngoại trú'},
    // {data: [270, 720, 1155, 135, 1500, 405, 600], label: 'Series C'}
  ];
  public lineChartLabels: Array<any> = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'];
  public lineChartOptions: any = {
    animation: false,
    responsive: true
  };
  public lineChartColours: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    // { // grey
    //   backgroundColor: 'rgba(148,159,177,0.2)',
    //   borderColor: 'rgba(148,159,177,1)',
    //   pointBackgroundColor: 'rgba(148,159,177,1)',
    //   pointBorderColor: '#fff',
    //   pointHoverBackgroundColor: '#fff',
    //   pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    // }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  // events
  public chartClicked(e: any): void {
    console.log(e);
  }
  public chartHovered(e: any): void {
    console.log(e);
  }
  ngOnInit() {
    this.logger.info('Hello from Home page!');
  }
  open(content) {
    const options: NgbModalOptions = {
      size: 'lg'
    };
    this.modalService.open(content, options);
  }
  testPrint() {
    this.svPhieuIn.print('PHIEU_CONG_KHAI_CLS_TRONG', {}).then(() => {
      this.logger.info('In thành công!');
    });
  }
}
