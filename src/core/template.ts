/* tslint:disable:use-input-property-decorator */

import {
    Directive,
    NgModule,
    TemplateRef,
    ViewContainerRef,
    Input,
    NgZone
} from '@angular/core';

import { DxTemplateHost } from './template-host';
import * as events from 'devextreme/events';

export const DX_TEMPLATE_WRAPPER_CLASS = 'dx-template-wrapper';

export class RenderData {
    model: any;
    index: number;
    container: any;
}

@Directive({
    selector: '[dxTemplate]'
})
export class DxTemplateDirective {
    @Input()
    set dxTemplateOf(value) {
        this.name = value;
    };
    name: string;

    constructor(private templateRef: TemplateRef<any>,
        private viewContainerRef: ViewContainerRef,
        templateHost: DxTemplateHost,
        private ngZone: NgZone) {
        templateHost.setTemplate(this);
    }

    render(renderData: RenderData) {
        let childView = this.viewContainerRef.createEmbeddedView(this.templateRef, {
            '$implicit': renderData.model,
            index: renderData.index
        });
        if (renderData.container) {
            renderData.container.append(childView.rootNodes);
        }
        // =========== WORKAROUND =============
        // https://github.com/angular/angular/issues/12243
        this.ngZone.run(() => {
            childView['detectChanges']();
        });
        // =========== /WORKAROUND =============
        childView.rootNodes.forEach((element) => {
            if (element.classList) {
                element.classList.add(DX_TEMPLATE_WRAPPER_CLASS);
            }

            events.one(element, 'dxremove', (e) => {
                if (!e._angularIntegration) {
                    childView.destroy();
                }
            });
        });

        return childView.rootNodes;
    }
}

@NgModule({
    declarations: [DxTemplateDirective],
    exports: [DxTemplateDirective]
})
export class DxTemplateModule { }
