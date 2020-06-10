import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

declare var jquery: any;
declare var $: any;
declare var navigator: any;
declare var window: any;
declare var cordova: any;

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnChanges {
  // tslint:disable-next-line: no-input-rename
  @Input('server') server = '';
  // tslint:disable-next-line: no-input-rename
  @Input('db') db = '';
  // tslint:disable-next-line: no-input-rename
  @Input('user') user = '';
  // tslint:disable-next-line: no-input-rename
  @Input('pass') pass = '';
  // tslint:disable-next-line: no-input-rename
  @Input('uid') uid = 0;
  ////////////////////////////////////////////
  // tslint:disable-next-line: no-input-rename
  @Input('inLoad') inLoad = true;
  // tslint:disable-next-line: no-input-rename
  @Input('logged') logged = false;
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
