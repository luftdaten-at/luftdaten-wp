(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var TextareaControl = components.TextareaControl;
    var __ = i18n.__;

    registerBlockType('luftdaten/jahresmittel-trend', {
        title: __('Jahresmittel (Trend) Section', 'luftdaten'),
        icon: 'chart-line',
        category: 'luftdaten',
        attributes: {
            title: {
                type: 'string',
                default: __('PM₂.₅ — Jahresmittel (Trend)', 'luftdaten'),
            },
            takeaway: {
                type: 'string',
                default: '',
            },
            keyFigure: {
                type: 'string',
                default: '',
            },
            description: {
                type: 'string',
                default: __('Jahresmittelwert (vereinfachte Aggregation) – im Wireframe über Messnetz gemittelt. In Produktion: stations- vs. bevölkerungsgewichtet entscheiden.', 'luftdaten'),
            },
            chartId: {
                type: 'string',
                default: 'pm25Chart',
            },
            chartDataUrl: {
                type: 'string',
                default: '',
            },
            yAxisLabel: {
                type: 'string',
                default: __('Jahresmittel in µg/m³', 'luftdaten'),
            },
            refLineValue: {
                type: 'number',
                default: 10,
            },
            refLineLabel: {
                type: 'string',
                default: __('EU 2030: 10 µg/m³', 'luftdaten'),
            },
            source: {
                type: 'string',
                default: __('Quelle: UBA/EEA — Wireframe Mock.', 'luftdaten'),
            },
            sourcePill: {
                type: 'string',
                default: __('Einheit: µg/m³', 'luftdaten'),
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            return el('div', { className: 'luftdaten-jahresmittel-trend-block' },
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Block Settings', 'luftdaten'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'luftdaten'),
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        }),
                        el(TextareaControl, {
                            label: __('Takeaway', 'luftdaten'),
                            value: attributes.takeaway,
                            onChange: function(value) {
                                setAttributes({ takeaway: value });
                            },
                            help: __('Optional key takeaway message', 'luftdaten'),
                            rows: 2,
                        }),
                        el(TextControl, {
                            label: __('Key Figure', 'luftdaten'),
                            value: attributes.keyFigure,
                            onChange: function(value) {
                                setAttributes({ keyFigure: value });
                            },
                            help: __('Key figure value (e.g., "—" or a number with unit)', 'luftdaten'),
                        }),
                        el(TextareaControl, {
                            label: __('Description', 'luftdaten'),
                            value: attributes.description,
                            onChange: function(value) {
                                setAttributes({ description: value });
                            },
                            rows: 3,
                        }),
                        el(TextControl, {
                            label: __('Chart ID', 'luftdaten'),
                            value: attributes.chartId,
                            onChange: function(value) {
                                setAttributes({ chartId: value });
                            },
                            help: __('DOM ID for the chart container', 'luftdaten')
                        }),
                        el(TextControl, {
                            label: __('Chart Data API URL', 'luftdaten'),
                            value: attributes.chartDataUrl,
                            onChange: function(value) {
                                setAttributes({ chartDataUrl: value });
                            },
                            help: __('Optional URL to fetch JSON data for the chart from an external API', 'luftdaten'),
                            type: 'url',
                        }),
                        el(TextControl, {
                            label: __('Y-Axis Label', 'luftdaten'),
                            value: attributes.yAxisLabel,
                            onChange: function(value) {
                                setAttributes({ yAxisLabel: value });
                            },
                            help: __('Label for the Y-axis (e.g., "Jahresmittel in µg/m³")', 'luftdaten'),
                        }),
                        el(TextControl, {
                            label: __('Reference Line Value', 'luftdaten'),
                            value: attributes.refLineValue,
                            onChange: function(value) {
                                setAttributes({ refLineValue: parseFloat(value) || 0 });
                            },
                            help: __('Numeric value for the horizontal reference line (e.g., 10)', 'luftdaten'),
                            type: 'number',
                        }),
                        el(TextControl, {
                            label: __('Reference Line Label', 'luftdaten'),
                            value: attributes.refLineLabel,
                            onChange: function(value) {
                                setAttributes({ refLineLabel: value });
                            },
                            help: __('Label for the reference line (e.g., "EU 2030: 10 µg/m³")', 'luftdaten'),
                        }),
                        el(TextareaControl, {
                            label: __('Source', 'luftdaten'),
                            value: attributes.source,
                            onChange: function(value) {
                                setAttributes({ source: value });
                            },
                            rows: 2,
                        }),
                        el(TextControl, {
                            label: __('Source Pill Text', 'luftdaten'),
                            value: attributes.sourcePill,
                            onChange: function(value) {
                                setAttributes({ sourcePill: value });
                            },
                            help: __('Optional additional information displayed as a pill (e.g., unit)', 'luftdaten')
                        })
                    )
                ),
                el('div', { className: 'luftdaten-jahresmittel-trend-preview' },
                    el('section', { className: 'section', style: { marginTop: '14px', border: '1px solid #ddd', borderRadius: '18px', background: '#fff', padding: '0' } },
                        el('div', { className: 'sectionHead', style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', padding: '14px 14px 10px', borderBottom: '1px solid #ddd', background: '#f5f5f5' } },
                            el('h2', { style: { margin: 0, fontSize: '14px' } }, attributes.title || __('PM₂.₅ — Jahresmittel (Trend)', 'luftdaten')),
                            el('div', { className: 'takeaway', style: { color: '#666', fontSize: '12px', lineHeight: '1.35', maxWidth: '560px', textAlign: 'right' } },
                                attributes.takeaway || '—'
                            )
                        ),
                        el('div', { className: 'sectionBody', style: { padding: '12px 14px 14px' } },
                            el('div', { className: 'bigNumberRow', style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'stretch', marginBottom: '10px' } },
                                el('div', { className: 'bigNumber', style: { background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '16px', padding: '12px' } },
                                    el('div', { className: 'num', style: { fontSize: '28px', marginTop: '6px' } }, attributes.keyFigure || '—'),
                                    el('div', { className: 'desc', style: { color: '#666', fontSize: '11px', marginTop: '8px', lineHeight: '1.35' } }, attributes.description || '')
                                ),
                                el('div', { className: 'chart', style: { width: '100%', height: '320px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '14px' } },
                                    __('Chart: ', 'luftdaten') + attributes.chartId
                                )
                            ),
                            el('div', { className: 'sourceLine', style: { marginTop: '10px', color: '#666', fontSize: '11px', lineHeight: '1.35', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' } },
                                el('div', {}, attributes.source || ''),
                                attributes.sourcePill ? el('div', { className: 'pill', style: { border: '1px solid #ddd', background: '#fff', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', color: '#666', display: 'inline-block' } }, attributes.sourcePill) : null
                            )
                        )
                    )
                )
            );
        },
        save: function() {
            return null; // Dynamic block, rendered server-side
        },
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n
);

