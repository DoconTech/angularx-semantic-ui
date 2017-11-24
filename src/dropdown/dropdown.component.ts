import { Component, Input, Output, EventEmitter, forwardRef,OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import _ from "lodash";

@Component({
  selector: 'lsu-dropdown',
  styles: [`.active,.visible{ display:block !important; }`],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  },
  template: `
      <div class="ui fluid selection dropdown" [attr.id]="id"
           [ngClass]="{'active':active,'visible':active,'search':search,'multiple':multiple,'disabled':disabled}"
           (click)="toggleSelectPanel($event)">
          <i class="dropdown icon"></i>
          <ng-container *ngIf="search">
            <input class="search" autocomplete='off' tabindex="0" [(ngModel)]="searchVal" (ngModelChange)="filterSearch($event)">
          </ng-container>

          <div class="default text" *ngIf="(!selectedItem || selectedItem.length == 0 )&& searchVal.length==0">
              {{ placeHolder }}
          </div>
          <div class="text" *ngIf="selectedItem && !multiple && !(searchVal.length>0)">
              {{ selectedItem[textField] || selectedItem }}
          </div>
          <div *ngIf="selectedItem && multiple">
              <a class="ui label transition visible" style="display: inline-block !important;" *ngFor="let item of selectedItem">
                  {{ item[textField] || item }}
                  <i class="delete icon" (click)="removeItem(item, $event)"></i>
              </a>
          </div>
          <div class="menu visible" #menuPanel [@menuPanelState]="menuPanelState"
               (@menuPanelState.start)="menuPanel.style.overflowY = 'hidden'"
               (@menuPanelState.done)="menuPanel.style.overflowY = 'auto'">
              <div class="item" [class.active]="isSelected(item)" [class.filtered]="isSelected(item) && multiple" (click)="itemClick(item, $event)" *ngFor="let item of data">
                {{ item[textField] || item }}
              </div>
          </div>
      </div>


  `,
  animations: [
    trigger('menuPanelState', [
      state('inactive', style({
        height: 0,
        opacity: 0
      })),
      state('active', style({
        height: '*',
        opacity: 1
      })),
      transition('inactive <=> active', animate('200ms ease'))
    ])
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropdownComponent),
    multi: true
  }]
})

export class DropdownComponent implements ControlValueAccessor {
  @Input()
  public data: Array<any>;

  @Input()
  public textField: string = 'text';

  @Input()
  public idField: string = 'id';

  @Input()
  public disabled: boolean = false;

  @Input()
  public placeHolder: string = '';

  @Input()
  public multiple: boolean = false;

  public searchVal: any = '';

  @Input()
  public search:boolean=false;

  @Output()
  public change: EventEmitter<any> = new EventEmitter<any>();
  public dataCopy:any;


  get active(): boolean {
    return this._active;
  }
  set active(v: boolean) {
    this._active = !!v;
    if (this._active) {
      this.menuPanelState = 'active';
    } else {
      this.menuPanelState = 'inactive';
    }
  }

  selectedItem: any;
  menuPanelState: string = 'inactive';

  id: string;

  _active: boolean = false;
  _onChange = (_: any) => { };
  _onTouched = () => { };

  constructor() {
    this.id = `lsu_dropdown_${Math.random()}`;
  }

  writeValue(value: any): void {
    if (value) {
      if (this.multiple) {
        let selectedItems = [];
        if (Array.isArray(value)) {
          let ids = value;
          if (this.idField) {
            ids = value.map(x => x[this.idField]).filter(x => !!x);
          }
          selectedItems = (this.data || []).filter(x => {
            return ids.indexOf(this.idField ? (x[this.idField] || x) : x) !== -1;
          });
        }
        this.selectedItem = selectedItems;
      } else {
        let isObj = typeof value === 'object';
        let selectedItems = (this.data || []).filter(x => {
          return (this.idField && isObj) ? value[this.idField] === x[this.idField] : value === x;
        });
        this.selectedItem = selectedItems[0];
      }
    } else {
      this.selectedItem = value;
    }
  }

  registerOnChange(fn: (_: any) => {}): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  ngOnInit(): void {
    if(this.search){
      this.dataCopy = _.clone(this.data, true);
    }

  }

  onDocumentClick(event: any): void {
    let id: string = event.target.id;
    if (this.active && id !== this.id) {
      this.active = false;
    }
  }

  toggleSelectPanel(event?: any): void {
    this.active = !this.active;
    if (event) {
      event.target.id = this.id;
    }
  }

  isSelected(item: any): boolean {
    if (!this.selectedItem) {
      return false;
    }
    if (this.multiple) {
      let index: number = this.selectedItem.indexOf(item);
      return index !== -1;
    } else {
      return this.selectedItem === item;
    }
  }

  itemClick(item: any, event: any): void {
    let value: any;
    if (this.multiple) {
      value = this.selectedItem || [];
      value.push(item);
      if (value.length === this.data.length) {
        this.toggleSelectPanel();
      }
    } else {
      value = item;
      this.toggleSelectPanel();
    }
    this.setValue(value);
    event.stopPropagation();
  }

  removeItem(item: any, event: any): void {
    let value: any = this.selectedItem;
    let index: number = value.indexOf(item);
    if (index !== -1) {
      value.splice(index, 1);
    }
    this.setValue(value);
    event.stopPropagation();
  }

  setValue(value: any) {
    this.selectedItem = value;
    this.searchVal ='';
    this._onChange(value);
    this.change.next(value);
  }

  filterSearch(value:any){
    // its plain simple array => textField ='text'
    // its object arrray but no searchBy specified=> textField
    // its object array and search by not empty => searchby will handel this use case later
    let s = this.textField;
    if(this.textField==='text'){
      this.data = this.dataCopy.filter(function(o){
        if (o.toLowerCase().indexOf(value.toLowerCase()) >= 0){
          return true
        }
      });

      if(!value){
        this.data = _.clone(this.dataCopy, true);
      }
    }

    else{
      this.data = this.dataCopy.filter(function(o){
        if (o[s].toLowerCase().indexOf(value.toLowerCase()) >= 0){
          return true
        }
      });

      if(!value){
        this.data = _.clone(this.dataCopy, true);
      }
    }



    // console.log(this.data);


  }

  searchText(obj,val,searchBy){

  }
}
