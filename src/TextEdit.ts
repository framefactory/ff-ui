/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export type TextAlign = "left" | "right" | "center";

/**
 * Emitted when the text is edited.
 * @event change
 */
export interface ITextEditChangeEvent extends CustomEvent
{
    type: "change";
    target: TextEdit;
    detail: {
        text: string;
        isEditing: boolean;
    }
}

@customElement("ff-text-edit")
export default class TextEdit extends CustomElement
{
    /** Optional name to identify the button. */
    @property({ type: String })
    name = "";

    /** Optional index to identify the button. */
    @property({ type: Number })
    index = 0;

    /** Text to be edited in the control. */
    @property({ type: String })
    text = "";

    /** Placeholder text to display if no other text is present. */
    @property({ type: String })
    placeholder = "";

    @property({ type: String })
    align: TextAlign = "left";

    protected initialValue: string = "";

    protected get textArea() {
        return this.getElementsByTagName("textarea").item(0) as HTMLTextAreaElement;
    }

    select()
    {
        const textArea = this.textArea;
        textArea && textArea.select();
    }

    focus()
    {
        const textArea = this.textArea;
        textArea && textArea.focus();
    }

    blur()
    {
        const textArea = this.textArea;
        textArea && textArea.blur();
    }

    hasFocus()
    {
        return this.textArea === document.activeElement;
    }

    protected firstConnected()
    {
        this.classList.add("ff-control", "ff-text-edit");
    }

    protected shouldUpdate(changedProperties: PropertyValues): boolean
    {
        // prevent rendering during editing
        if (this.hasFocus()) {
            return false;
        }

        return super.shouldUpdate(changedProperties);
    }

    protected render()
    {
        return html`<textarea
            .value=${this.text} placeholder=${this.placeholder}
            @keydown=${this.onKeyDown} @change=${this.onChange} @input=${this.onInput}
            @focus=${this.onFocus} @blur=${this.onBlur}
            style="text-align: ${this.align};"></textarea>`;
    }

    protected onKeyDown(event: KeyboardEvent)
    {
        const target = event.target as HTMLTextAreaElement;

        if (event.key === "Escape") {
            this.revert(target);
            target.blur();
        }
    }

    protected onChange(event)
    {
        event.stopPropagation();
        event.preventDefault();

        this.text = event.target.value;
        this.dispatchChangeEvent(this.text, false);
    }

    protected onInput(event)
    {
        event.stopPropagation();
        event.preventDefault();

        this.text = event.target.value;
        this.dispatchChangeEvent(this.text, true);
    }

    protected onFocus(event)
    {
        this.initialValue = event.target.value;
    }

    protected onBlur(event)
    {
        this.commit(event.target);
        this.requestUpdate();
    }

    protected revert(element: HTMLTextAreaElement)
    {
        element.value = this.initialValue;
        this.dispatchChangeEvent(element.value, false);
    }

    protected commit(element: HTMLInputElement)
    {
        this.initialValue = element.value;
        this.dispatchChangeEvent(element.value, false);
    }

    protected dispatchChangeEvent(text: string, isEditing: boolean)
    {
        this.dispatchEvent(new CustomEvent("change", {
            detail: {
                text,
                isEditing
            }
        }));
    }
}