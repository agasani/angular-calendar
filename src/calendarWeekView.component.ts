import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  OnInit,
  OnDestroy
} from '@angular/core';
import {NgFor, NgClass, DatePipe} from '@angular/common';
import {
  WeekDay,
  CalendarEvent,
  WeekViewEventRow,
  getWeekViewHeader,
  getWeekView
} from 'calendar-utils';
import {CalendarDate} from './calendarDate.pipe';
import {CalendarEventTitle} from './calendarEventTitle.pipe';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'mwl-calendar-week-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cal-week-view">
      <div class="cal-day-headers">
        <div
          class="cal-header"
          *ngFor="let day of days; trackBy:trackByItem"
          [class.cal-past]="day.isPast"
          [class.cal-today]="day.isToday"
          [class.cal-future]="day.isFuture"
          [class.cal-weekend]="day.isWeekend"
          (click)="dayClicked.emit({date: day.date.toDate()})">
          <b>{{ day.date | calendarDate:'week':'columnHeader' }}</b><br>
          <span>{{ day.date | calendarDate:'week':'columnSubHeader' }}</span>
        </div>
      </div>
      <div *ngFor="let eventRow of eventRows; trackBy:trackByItem">
        <div
          class="cal-event-container"
          *ngFor="let event of eventRow.row; trackBy:trackByItem"
          [style.width]="((100 / 7) * event.span) + '%'"
          [style.marginLeft]="((100 / 7) * event.offset) + '%'">
          <div
            class="cal-event"
            [class.cal-starts-within-week]="!event.startsBeforeWeek"
            [class.cal-ends-within-week]="!event.endsAfterWeek"
            [style.backgroundColor]="event.event.color.secondary"
            [ngClass]="event.event?.cssClass">
            <a
              class="cal-event-title"
              href="javascript:;"
              [innerHtml]="event.event | calendarEventTitle:'week'"
              (click)="eventClicked.emit({event: event.event})">
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  directives: [NgFor, NgClass],
  pipes: [CalendarDate, CalendarEventTitle],
  providers: [DatePipe]
})
export class CalendarWeekView implements OnChanges, OnInit, OnDestroy {

  @Input() date: Date;
  @Input() events: CalendarEvent[] = [];
  @Input() refresh: Subject<any>;
  @Output() dayClicked: EventEmitter<any> = new EventEmitter();
  @Output() eventClicked: EventEmitter<any> = new EventEmitter();

  private days: WeekDay[];
  private eventRows: WeekViewEventRow[] = [];
  private refreshSubscription: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll();
        this.cdr.markForCheck();
      });
    }
  }

  ngOnChanges(changes: any): void {

    if (changes.date) {
      this.refreshHeader();
    }

    if (changes.events || changes.date) {
      this.refreshBody();
    }

  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private refreshHeader(): void {
    this.days = getWeekViewHeader({
      viewDate: this.date
    });
  }

  private refreshBody(): void {
    this.eventRows = getWeekView({
      events: this.events,
      viewDate: this.date
    });
  }

  private refreshAll(): void {
    this.refreshHeader();
    this.refreshBody();
  }

  private trackByItem(index: number, obj: any): any {
    return obj;
  }

}
