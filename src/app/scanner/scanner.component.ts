import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit, OnChanges {
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
  public showPicking = false;
  public showStock = false;
  ////////////////////////////
  safe = 'normal';

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

  public goOut(): void {
    this.showPicking = false;
    this.showStock = false;
  }

  /* LogOut emiter */
  public logOut(): void {
    this.log.emit();
  }

}
