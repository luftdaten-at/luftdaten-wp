(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var __ = i18n.__;

    registerBlockType('luftdaten/city-search', {
        title: __('City Search Bar', 'luftdaten'),
        icon: 'search',
        category: 'luftdaten',
        attributes: {
            title: {
                type: 'string',
                default: __('Nach Themen oder Gemeinden suchen', 'luftdaten'),
            },
            placeholder: {
                type: 'string',
                default: __('Nach Themen oder Gemeinden suchen', 'luftdaten'),
            },
            apiUrl: {
                type: 'string',
                default: 'https://api.luftdaten.at/v1/city/all',
            },
            baseUrl: {
                type: 'string',
                default: 'https://datahub.luftdaten.at/cities/',
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            return el('div', { className: 'luftdaten-city-search-block' },
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Block Settings', 'luftdaten'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'luftdaten'),
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        }),
                        el(TextControl, {
                            label: __('Placeholder Text', 'luftdaten'),
                            value: attributes.placeholder,
                            onChange: function(value) {
                                setAttributes({ placeholder: value });
                            }
                        }),
                        el(TextControl, {
                            label: __('Cities API URL', 'luftdaten'),
                            value: attributes.apiUrl,
                            onChange: function(value) {
                                setAttributes({ apiUrl: value });
                            },
                            help: __('API endpoint to fetch city data', 'luftdaten'),
                            type: 'url',
                        }),
                        el(TextControl, {
                            label: __('Base URL for City Links', 'luftdaten'),
                            value: attributes.baseUrl,
                            onChange: function(value) {
                                setAttributes({ baseUrl: value });
                            },
                            help: __('Base URL where city slugs will be appended', 'luftdaten'),
                            type: 'url',
                        })
                    )
                ),
                el('div', { className: 'luftdaten-city-search-preview' },
                    attributes.title ? el('h2', { style: { margin: '0 0 16px 0', fontSize: '24px', fontWeight: 600, color: '#333' } }, attributes.title) : null,
                    el('div', { style: { 
                        padding: '20px', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        background: '#f9fafb',
                        maxWidth: '600px',
                        margin: '0 auto'
                    } },
                        el('form', { 
                            style: { 
                                display: 'flex', 
                                gap: '10px',
                                alignItems: 'stretch'
                            },
                            onSubmit: function(e) { e.preventDefault(); }
                        },
                            el('input', {
                                type: 'text',
                                placeholder: attributes.placeholder || __('Nach Themen oder Gemeinden suchen', 'luftdaten'),
                                style: {
                                    flex: 1,
                                    padding: '12px 16px',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    outline: 'none'
                                },
                                disabled: true
                            }),
                            el('button', {
                                type: 'submit',
                                style: {
                                    padding: '12px 24px',
                                    background: '#2e88c1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                },
                                disabled: true
                            }, __('Suchen', 'luftdaten'))
                        ),
                        el('p', { 
                            style: { 
                                marginTop: '10px', 
                                fontSize: '12px', 
                                color: '#666', 
                                fontStyle: 'italic',
                                textAlign: 'center'
                            } 
                        }, __('Search preview - Autocomplete will be active on frontend', 'luftdaten'))
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

