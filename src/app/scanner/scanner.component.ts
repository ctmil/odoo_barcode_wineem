import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit, OnChanges {
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
  public showPicking = false;
  public showStock = false;
  ////////////////////////////

  constructor() { }

  // Lifehooks funs

  public ngOnInit(): void {}

  public ngOnChanges(): void {
    if (this.logged) {
    }
  }

  // END - Lifehooks funs

  // Internal use funs

  public picking(): void {
    this.showPicking = true;
  }

  public stock(): void {
    this.showStock = true;
  }

  // END - Internal use funs

  /* LogOut emiter */
  public logOut(): void {
    this.log.emit();
  }

}
