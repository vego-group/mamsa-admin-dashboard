/**
 * The skeleton the "قالب وصف" button drops into an empty description field.
 *
 * Deliberately **not** in the dictionaries, and deliberately Arabic in both locales.
 * Everything in `src/i18n` is console chrome shown to an admin; this is guest-facing
 * content that ends up on an Arabic listing page. An English admin who pressed the
 * button and got English headings would be handed a skeleton that is wrong for the site
 * it is going to — the button's *label* is translated, its *output* is not.
 *
 * Mamsa-owned units are the example partners are held to in review, so the skeleton is
 * the shape a good partner description has: a lead, what stands out, the rooms, how to
 * get there, and the one condition worth calling out.
 */
export const DESCRIPTION_TEMPLATE = `وصف مختصر للمكان وموقعه في سطرين.

## ما يميّز المكان
*ميزة أولى*
*ميزة ثانية*

## المساحات
- **غرفة النوم:** ...
- **الصالة:** ...

## طريقة الوصول
1. ...
2. ...

> ملاحظة عن تسجيل الدخول أو أي شرط مهم.`;
