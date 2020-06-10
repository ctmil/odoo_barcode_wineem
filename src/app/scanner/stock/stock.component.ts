import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnChanges {
  @Input() server = '';
  @Input() db = '';
  @Input() user = '';
  @Input() pass = '';
  @Input() uid = 0;
  ////////////////////////////////////////////
  @Input() inLoad = true;
  @Input() logged = false;
  @Output() log = new EventEmitter();
  ////////////////////////////

  navStock = true;
  addStockVisible = false;
  fixStockVisible = false;
  checkStockVisible = false;

  constructor() { }

  // Lifehooks funs

  public ngOnInit(): void {}

  public ngOnChanges(): void {}

  // END - Lifehooks funs

  // Internal use funs

  public addStock(): void {
    this.navStock = false;
    this.addStockVisible = true;
  }

  public fixStock(): void {
    this.navStock = false;
    this.fixStockVisible = true;
  }

  public checkStock(): void {
    this.navStock = false;
    this.checkStockVisible = true;
  }

  // END - Internal use funs

}
