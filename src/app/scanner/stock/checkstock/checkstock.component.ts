import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

declare var jquery: any;
declare var $: any;
declare var navigator: any;
declare var window: any;
declare var cordova: any;

@Component({
  selector: 'app-checkstock',
  templateUrl: './checkstock.component.html',
  styleUrls: ['./checkstock.component.scss']
})
export class CheckstockComponent implements OnInit {
  @Input() server = '';
  @Input() db = '';
  @Input() user = '';
  @Input() pass = '';
  @Input() uid = 0;

  ////////////////////////////
  public scanConfig = {
    preferFrontCamera : false,    // iOS and Android
    showFlipCameraButton : false, // iOS and Android
    showTorchButton : true,       // iOS and Android
    torchOn: false,               // Android, launch with the torch switched on (if available)
    prompt : 'Place a barcode inside the scan area', // Android
    resultDisplayDuration: 0,     // Time of show
    orientation : 'portrait',     // Android only (portrait|landscape), default unset so it rotates with the device
    disableAnimations : true,     // iOS
    disableSuccessBeep: false     // iOS and Android
  };

  constructor() { }

  ngOnInit() {
  }

  /* Scann Barcode Function */
  public startScann(): void {
    cordova.plugins.barcodeScanner.scan(
      (result: any) => {
        console.log('Código escaneado correctamente');
      },
      function (error: any) {
        console.log('Scanning failed: ' + error);
        alert('El escaneo falló, intente nuevamente');
      },
      this.scanConfig
    );
  }

}
