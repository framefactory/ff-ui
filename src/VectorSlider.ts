/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import Vector2 from "@ff/core/Vector2";

import CustomElement, { customElement, html, property, PropertyValues } from "./CustomElement";
import DragHelper, { IDragTarget } from "./DragHelper";

////////////////////////////////////////////////////////////////////////////////

export interface IVectorSliderChangeEvent extends CustomEvent
{
    type: "change";
    target: VectorSlider;
    detail: {
        value: Vector2;
        isDragging: boolean;
    }
}

@customElement("ff-vector-slider")
export default class VectorSlider extends CustomElement implements IDragTarget
{
    @property({ attribute: false })
    value = new Vector2();

    private _knob: CustomElement;

    private _offsetX = 0;
    private _offsetY = 0;

    constructor()
    {
        super();

        this._knob = new CustomElement()
        .addClass("ff-knob")
        .setStyle({ position: "absolute" });

        // observe size changes, note that ResizeObserver is not defined in TS yet
        const ResizeObserver = (window as any).ResizeObserver;
        if (ResizeObserver) {
            new ResizeObserver(() => this.requestUpdate("value")).observe(this);
        }

        new DragHelper(this);
    }

    setXY(x: number, y: number)
    {
        this.value.set(x, y);
        this.requestUpdate();
    }

    dragStart(event: PointerEvent)
    {
        const knob = this._knob;
        const track = this.getBoundingClientRect();

        if (event.target === this._knob) {
            this._offsetX = event.clientX - knob.offsetLeft + (knob.clientWidth - knob.offsetWidth) * 0.5;
            this._offsetY = event.clientY - knob.offsetTop + (knob.clientHeight - knob.offsetHeight) * 0.5;
        }
        else {
            this._offsetX = track.left + knob.clientWidth * 0.8;
            this._offsetY = track.top + knob.clientHeight * 0.8;
        }

        this.dragMove(event);
    }

    dragMove(event: PointerEvent)
    {
        const knob = this._knob;
        const px = event.clientX - this._offsetX;
        const py = event.clientY - this._offsetY;

        let x = px / (this.clientWidth - knob.clientWidth);
        x = math.limit(x, 0, 1);
        let y = 1 - py / (this.clientHeight - knob.clientHeight);
        y = math.limit(y, 0, 1);

        if (x !== this.value.x || y !== this.value.y) {
            this.value = this.value.set(x, y);
            this.emitChangeEvent(true);
        }
    }

    dragEnd()
    {
        this.emitChangeEvent(false);
    }

    protected firstConnected()
    {
        this.setStyle({
            position: "relative",
            touchAction: "none"
        });

        this.setAttribute("touch-action", "none");
        this.setAttribute("tabindex", "0");

        this.classList.add("ff-control", "ff-vector-slider");

        this.appendChild(this._knob);
    }

    protected update(changedProperties: PropertyValues): void
    {
        const x = math.limit(this.value.x, 0, 1);
        const y = math.limit(this.value.y, 0, 1);
        const knob = this._knob;

        const width = this.clientWidth - knob.clientWidth;
        const height = this.clientHeight - knob.clientHeight;

        knob.style.left = `${(x * width).toFixed(1)}px`;
        knob.style.top = `${((1 - y) * height).toFixed(1)}px`;

        super.update(changedProperties);
    }

    protected emitChangeEvent(isDragging: boolean)
    {
        this.dispatchEvent(new CustomEvent("change", {
            detail: {
                value: this.value,
                isDragging
            },
            bubbles: true
        }));

    }
}