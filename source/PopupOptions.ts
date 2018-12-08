/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Popup from "./Popup";
import { customElement, html, property } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export interface IPopupMenuSelectEvent extends CustomEvent
{
    detail: {
        index: number;
        option: string;
    }
}

@customElement("ff-popup-options")
export default class PopupOptions extends Popup
{
    static readonly selectEvent = "ff-popup-options-select";

    @property({ attribute: false })
    options: string[];

    @property({ type: Number })
    selectionIndex: number;

    constructor(options?: string[])
    {
        super();

        this.onClick = this.onClick.bind(this);
        this.addEventListener("click", this.onClick);

        this.options = options || [];
        this.selectionIndex = -1;
    }

    protected render()
    {
        return html`
            ${this.options.map((option, index) => html`
                <button>${option}</button>
            `)}
        `;
    }

    protected updated()
    {
        const index = this.selectionIndex >= 0 ? this.selectionIndex : 0;
        const button = this.children.item(index) as HTMLButtonElement;
        if (button) {
            button.focus();
        }
    }

    protected firstUpdated()
    {
        this.classList.add("ff-menu", "ff-popup-menu");

        this.setStyle({
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            zIndex: "1000",
            opacity: "0",
        });
    }

    protected onClick(event: MouseEvent)
    {
        const children = this.getChildrenArray();
        const index = children.indexOf(event.target as Element);

        if (index >= 0 && index < this.options.length) {
            this.dispatchEvent(new CustomEvent(PopupOptions.selectEvent, { detail: {
                    index,
                    option: this.options[index]
                }}) as IPopupMenuSelectEvent);
        }

        this.remove();
    }




}