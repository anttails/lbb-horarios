import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { CdnService } from './services/cdn.service';
import { CommonModule } from '@angular/common';
import {
  Observable,
  OperatorFunction,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDatepickerModule,
  NgbModal,
  NgbTimeAdapter,
  NgbTimepicker,
  NgbTooltip,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faCircleExclamation,
  faLightbulb,
  faLocationDot,
  faMoon,
  faPencil,
  faRefresh,
  faSearch,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { StationTrainInfoComponent } from './components/station/station-train-info/station-train-info.component';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { TrainViewComponent } from './components/views/train-view/train-view.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CustomAdapter,
  CustomDateParserFormatter,
} from './classes/ngb-datepicker-adapters';
import { CommonFunctionsService } from './services/common-functions.service';
import { NgbTimeStringAdapter } from './classes/ngb-timepicker-adapters';
import { TrainTypeCheckPipe } from './pipes/train-type-check.pipe';
import { FormMode } from './models/form-mode';
import { CommonEventsService } from './services/common-events.service';
import { StationForm, TrainForm } from './models/form-models';
import { CustomDatepickerI18n, I18n } from './classes/ngb-datepicker-pt';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hbb-root',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    NgbDatepickerModule,
    NgbTimepicker,
    NgbTooltip,
    NgbTypeaheadModule,
    RouterModule,
    RouterOutlet,
    StationTrainInfoComponent,
    TrainTypeCheckPipe,
    TrainViewComponent,
    TranslateModule,
  ],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    { provide: NgbTimeAdapter, useClass: NgbTimeStringAdapter },
    I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  // * Common
  // Forms
  protected faCheck = faCheck;
  protected faEdit = faPencil;
  protected faSearch = faSearch;
  protected faSpinner = faSpinner;
  protected faWarning = faCircleExclamation;
  protected formMode!: FormMode;
  readonly FormMode = FormMode;

  // Lang
  protected currentLang = this.translate.getDefaultLang();
  protected langs: string[] = ['pt', 'en'];

  // Geolocation
  @ViewChild('locationModal') locationModal!: TemplateRef<any>;
  @ViewChild('locationT') locationTooltip!: NgbTooltip;
  protected locationCode: string = '';
  protected locationDot = faLocationDot;
  protected locationError = false;
  protected locationList: any[] = [];
  protected locationLoading = false;
  protected locationSupported = navigator.geolocation;

  // Route
  // Listen for the route url change in order to switch to the correct form ;)
  // https://stackoverflow.com/questions/66705251/angular-how-to-detect-route-changes-in-current-component
  private routeSub = this.router.events
    .pipe(
      filter((event) => event instanceof NavigationStart),
      map((event) => event as NavigationStart) // appease typescript
    )
    .subscribe((event) => {
      // Get queryParams out of the way
      const root = event.url.split('?');

      switch (root[0]) {
        case '/train': {
          if (root.length > 1) {
            this.trainFormLoading = true;
          }
          this.formMode = FormMode.Train;
          break;
        }
        case '/station': {
          if (root.length > 1) {
            this.stationFormLoading = true;
          }
          this.formMode = FormMode.Station;
          break;
        }
        default: {
          this.formMode = FormMode.Station;
          break;
        }
      }
    });

  // Theme
  protected dark: boolean = false;
  protected themeIcon!: IconProp;

  // * Station
  readonly MAX_TYPES = StationForm.MAX_TYPES;
  readonly MIN_TYPES = StationForm.MIN_TYPES;
  protected stationFormLoading = false;
  protected stationForm: StationForm = new StationForm();

  // Station search
  protected faRefresh = faRefresh;
  protected searchingStation = false;
  protected searchStationFailed = false;

  protected searchStationFormatter = (x: { name: string }) => x.name;
  protected searchStationTypeAhead: OperatorFunction<
    string,
    readonly string[]
  > = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingStation = true)),
      switchMap((term) =>
        term.length < 2
          ? of([])
          : this.cdnService.searchStations(term).pipe(
              tap(() => (this.searchStationFailed = false)),
              catchError(() => {
                this.searchStationFailed = true;
                return of([]);
              })
            )
      ),
      tap(() => (this.searchingStation = false))
    );
  };

  // Hours
  protected hourToggle = false;

  // Train type filters
  protected typeToggle = false;
  protected trainTypes = ['i', 'a', 'ic', 'ir', 'r', 'u', 'e', 'm', 's'];

  // * Train
  protected trainFormLoading = false;
  protected trainForm: TrainForm = new TrainForm();

  constructor(
    private activatedRoute: ActivatedRoute,
    private cdnService: CdnService,
    private commonEventsService: CommonEventsService,
    private commonFunctionsService: CommonFunctionsService,
    private modalService: NgbModal,
    private router: Router,
    private translate:  TranslateService
  ) {

    this.commonEventsService.stationLoaded.subscribe((item) => {
      //if(item.stationData){
        this.stationForm.id = item.stationData;
      //}
      this.stationFormLoading = !item.loaded;
    });

    this.commonEventsService.trainLoaded.subscribe((item) => {
      this.trainFormLoading = !item.loaded;
    });

    this.setupLanguage();
    this.setupTheme(false);
  }

  ngOnInit(): void {
    let number;
    let date;

    let start;
    let end;
    let types;


    this.activatedRoute.queryParamMap.subscribe((data) => {
      // Check if it's valid number by guard
      number = data.get('number');
      date = data.get('date');

      start = data.get('start');
      end = data.get('end');
      types = data.get('types');

      // Check for valid train number:
      if (
        number &&
        this.commonFunctionsService.REGEXP_TRAIN_NUMBER.test(number)
      ) {
        this.trainForm.number = parseInt(number);
      }

      // Check for valid date:
      date = this.commonFunctionsService.setValidDate(date);
      this.stationForm.date = date;
      this.trainForm.date = date;

      // Check for valid hours:
      const hours = this.commonFunctionsService.getHourSet(start,end);
      this.stationForm.start = hours[0];
      this.stationForm.end = hours[1];

      // Check for valid types. If valid, convert to int. If not, get default / user saved
      if (types && this.commonFunctionsService.REGEXP_TRAIN_TYPES.test(types)) {
        this.stationForm.types = parseInt(types);
      } else {
        this.stationForm.types = this.commonFunctionsService.getDefaultOrUserTypes();
      }

    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  // * Common
  setupLanguage(code?: string): void {

    // First, let's get the user override.
    if(!code){
      const pref = localStorage.getItem('lang');

      // If it's valid, that takes priority
      if(pref && pref.length == 2){
        this.currentLang = pref.toLowerCase();
      } else {
        // Invalid? What's the browser default?
        const browserDefault = this.translate.getBrowserLang();
        // If valid, set
        if(browserDefault && browserDefault.length == 2 && this.translate.getLangs()?.includes(browserDefault)){
          this.currentLang = browserDefault;
        }
      }

    } else if (code.length == 2) {
      this.currentLang = code;
      localStorage.setItem('lang', code.toLowerCase());
    }

    this.translate.use(this.currentLang);
  }

  setupTheme(toggle = true): void {

    // First, let's get the user override. Default value is light,
    // dark is what we want to check.
    if(!toggle){
      const pref = localStorage.getItem('theme');

      // If it's valid, that takes priority
      if(pref == 'dark' || pref == 'light'){
        this.dark = pref == 'dark';
      } else if(window.matchMedia('(prefers-color-scheme: dark)').matches){
        // Invalid? What's the system pref, if there is?
        this.dark = true;
      }

    } else if (toggle) {
      this.dark = !this.dark;
    }
    this.themeIcon = this.dark ? faLightbulb : faMoon;
    document.documentElement.setAttribute(
      'data-bs-theme',
      this.dark ? 'dark' : 'light'
    );
    localStorage.setItem('theme', this.dark ? 'dark' : 'light');
  }

  getToday() {
    return this.commonFunctionsService.getToday();
  }

  // * Location
  // TODO Optimize
  getLocation() {
    this.locationTooltip.close();
    this.locationLoading = true;
    this.locationError = false;
    this.locationList = [];
    this.locationCode = '';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          this.cdnService
            .getNearestStations(
              position.coords.latitude,
              position.coords.longitude
            )
            .subscribe({
              next: (value) => {
                this.locationError = false;
                if (value.length) {
                  this.locationList = value;
                  this.modalService.open(this.locationModal, {
                    backdrop: 'static',
                    centered: true,
                    scrollable: true
                  });
                } else {
                  this.modalService.open(this.locationModal, { centered: true });
                }
                this.locationLoading = false;
              },
              error: (err :HttpErrorResponse) => {
                this.locationCode = (err.error && err.error.message) ? err.error.message : 'error';
                this.locationLoading = false;
                this.locationError = true;
                this.modalService.open(this.locationModal, { centered: true });
              },
            });
        },
        (error: GeolocationPositionError) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              this.locationCode = 'userDenied';
              break;
            case error.POSITION_UNAVAILABLE:
              this.locationCode = 'unavailable';
              break;
            case error.TIMEOUT:
              this.locationCode = 'timeout';
              break;
            default:
              this.locationCode = 'error';
              break;
          }
          this.locationLoading = false;
          this.locationError = true;
          this.modalService.open(this.locationModal, { centered: true });
        },
        {
          timeout: 15000,
        }
      );
    } else {
      this.locationCode = 'notSupported';
      this.locationLoading = false;
      this.locationError = true;
      this.modalService.open(this.locationModal, { centered: true });
    }
  }

  selectStationGeo(item: any): void {
    this.stationForm.id = item;
    this.stationForm.date = this.commonFunctionsService.setValidDate();
    const hours = this.commonFunctionsService.getHourSet(null,null);
    this.stationForm.start = hours[0];
    this.stationForm.end = hours[1];
    this.stationForm.types = this.commonFunctionsService.getDefaultOrUserTypes();

    this.formMode = FormMode.Station;
    this.modalService.dismissAll();
    this.onStationSubmit();
  }

  // * Station Form
  onStationSubmit(): void {
    this.hourToggle = false;
    this.typeToggle = false;
    this.stationFormLoading = true;
    this.router.navigate(['/station'], {
      queryParams: {
        id: this.stationForm.id.id,
        date: this.stationForm.date,
        start: this.stationForm.start,
        end: this.stationForm.end,
        types: this.stationForm.types,
      },
    });
  }

  changeTypeStatus(idx: number, event: any): void {
    const check = event.target.checked;
    this.stationForm.types =
      this.stationForm.types + Math.pow(2, idx) * (check ? 1 : -1);

    if(this.stationForm.types && this.commonFunctionsService.REGEXP_TRAIN_TYPES.test(this.stationForm.types + '')){
      localStorage.setItem('types', this.stationForm.types + '');
    }

  }


  // * Train Form
  onTrainSubmit(): void {
    this.trainFormLoading = true;
    this.router.navigate(['/train'], {
      queryParams: { number: this.trainForm.number, date: this.trainForm.date },
    });
  }
}
