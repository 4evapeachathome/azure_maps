import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-state-tooltip',
  template: `
    <div class="tooltip-container" [style.left.px]="x" [style.top.px]="y">
      <div class="tooltip-content">
        {{ stateName }}
        <div class="tooltip-arrow"></div>
      </div>
    </div>
  `,
  styleUrls: ['./state-tooltip.component.scss']
})
export class StateTooltipComponent {
  @Input() stateName = '';
  @Input() x = 0;
  @Input() y = 0;
}
