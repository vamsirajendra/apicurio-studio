/**
 * @license
 * Copyright 2017 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import {Oas20Response, OasDocument} from "oai-ts-core";
import {
    createChangePropertyCommand,
    createChangeResponseTypeCommand,
    createDelete20ExampleCommand,
    createSetExampleCommand,
    ICommand,
    SimplifiedType
} from "oai-ts-commands";
import {CommandService} from "../../../../_services/command.service";
import {DocumentService} from "../../../../_services/document.service";
import {EditExample20Event} from "../../../dialogs/edit-example-20.component";
import {AbstractBaseComponent} from "../../../common/base-component";
import {SelectionService} from "../../../../_services/selection.service";
import {ObjectUtils} from "apicurio-ts-core";


@Component({
    moduleId: module.id,
    selector: "response-tab",
    templateUrl: "response-tab.component.html",
    styleUrls: [ "response-tab.component.css" ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseTabComponent extends AbstractBaseComponent {

    @Input() response: Oas20Response;

    protected _model: SimplifiedType = null;

    constructor(private changeDetectorRef: ChangeDetectorRef, private documentService: DocumentService,
                private commandService: CommandService, private selectionService: SelectionService) {
        super(changeDetectorRef, documentService, selectionService);
    }

    protected onDocumentChange(): void {
        this._model = SimplifiedType.fromSchema(this.response.schema);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes["response"]) {
            this._model = SimplifiedType.fromSchema(this.response.schema);
        }
    }

    public model(): SimplifiedType {
        return this._model;
    }

    public document(): OasDocument {
        return this.response.ownerDocument();
    }

    public hasExamples(): boolean {
        if (ObjectUtils.isNullOrUndefined(this.response.examples)) {
            return false;
        }
        return this.response.examples.exampleContentTypes().length > 0;
    }

    public exampleContentTypes(): string[] {
        return this.response.examples.exampleContentTypes();
    }

    public exampleDisplayValue(contentType: string): string {
        let evalue: any = this.response.examples.example(contentType);
        if (typeof evalue === "object" || Array.isArray(evalue)) {
            evalue = JSON.stringify(evalue);
        }
        return evalue;
    }

    public exampleValue(contentType: string): string {
        let evalue: any = this.response.examples.example(contentType);
        return evalue;
    }

    public displayType(): SimplifiedType {
        return SimplifiedType.fromSchema(this.response.schema);
    }

    public changeType(newType: SimplifiedType): void {
        let nt: SimplifiedType = new SimplifiedType();
        nt.type = newType.type;
        nt.enum = newType.enum;
        nt.of = newType.of;
        nt.as = newType.as;
        let command: ICommand = createChangeResponseTypeCommand(this.document(), this.response, nt);
        this.commandService.emit(command);
        this._model = nt;
    }

    public setDescription(description: string): void {
        let command: ICommand = createChangePropertyCommand<string>(this.document(), this.response, "description", description);
        this.commandService.emit(command);
    }

    public deleteExample(contentType: string): void {
        let command: ICommand = createDelete20ExampleCommand(this.document(), this.response, contentType);
        this.commandService.emit(command);
    }

    public addExample(exampleData: any): void {
        let command: ICommand = createSetExampleCommand(this.document(), this.response, exampleData.value, exampleData.contentType);
        this.commandService.emit(command);
    }

    public editExample(event: EditExample20Event): void {
        let command: ICommand = createSetExampleCommand(this.document(), this.response, event.value, event.contentType);
        this.commandService.emit(command);
    }

}
