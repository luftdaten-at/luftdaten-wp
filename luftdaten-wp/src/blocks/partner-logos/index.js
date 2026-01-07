(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var Button = components.Button;
    var MediaUpload = blockEditor.MediaUpload;
    var __ = i18n.__;

    registerBlockType('luftdaten/partner-logos', {
        title: __('Partner Logos', 'luftdaten'),
        icon: 'groups',
        category: 'luftdaten',
        attributes: {
            title: {
                type: 'string',
                default: __('Unsere Partner', 'luftdaten'),
            },
            partners: {
                type: 'array',
                default: [],
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            function updatePartner(index, field, value) {
                var newPartners = attributes.partners.slice();
                newPartners[index] = Object.assign({}, newPartners[index], { [field]: value });
                setAttributes({ partners: newPartners });
            }

            function addPartner() {
                var newPartners = attributes.partners.slice();
                newPartners.push({
                    name: '',
                    logoId: null,
                    logoUrl: '',
                    link: '',
                });
                setAttributes({ partners: newPartners });
            }

            function removePartner(index) {
                var newPartners = attributes.partners.slice();
                newPartners.splice(index, 1);
                setAttributes({ partners: newPartners });
            }

            return el('div', { className: 'luftdaten-partner-logos-block' },
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Block Settings', 'luftdaten'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'luftdaten'),
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        }),
                        el('div', { style: { marginTop: '20px' } },
                            el('strong', { style: { display: 'block', marginBottom: '10px' } }, __('Partner Logos', 'luftdaten')),
                            attributes.partners.map(function(partner, index) {
                                return el(PanelBody, {
                                    key: index,
                                    title: partner.name || __('Partner', 'luftdaten') + ' ' + (index + 1),
                                    initialOpen: false
                                },
                                    el(TextControl, {
                                        label: __('Partner Name', 'luftdaten'),
                                        value: partner.name || '',
                                        onChange: function(value) {
                                            updatePartner(index, 'name', value);
                                        }
                                    }),
                                    el('div', { style: { marginBottom: '10px' } },
                                        el('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 600 } }, __('Logo', 'luftdaten')),
                                        el(MediaUpload, {
                                            onSelect: function(media) {
                                                updatePartner(index, 'logoId', media.id);
                                                updatePartner(index, 'logoUrl', media.url);
                                            },
                                            allowedTypes: ['image'],
                                            value: partner.logoId || null,
                                            render: function(obj) {
                                                return el(Button, {
                                                    onClick: obj.open,
                                                    isSecondary: true,
                                                    style: { width: '100%', marginBottom: '10px' }
                                                }, partner.logoUrl ? __('Change Logo', 'luftdaten') : __('Select Logo', 'luftdaten'));
                                            }
                                        }),
                                        partner.logoUrl ? el('div', { style: { marginTop: '10px' } },
                                            el('img', {
                                                src: partner.logoUrl,
                                                alt: partner.name || __('Partner Logo', 'luftdaten'),
                                                style: { maxWidth: '100%', height: 'auto', display: 'block', marginBottom: '10px' }
                                            }),
                                            el(Button, {
                                                isLink: true,
                                                isDestructive: true,
                                                onClick: function() {
                                                    updatePartner(index, 'logoId', null);
                                                    updatePartner(index, 'logoUrl', '');
                                                },
                                                style: { fontSize: '12px' }
                                            }, __('Remove Logo', 'luftdaten'))
                                        ) : null
                                    ),
                                    el(TextControl, {
                                        label: __('Link URL', 'luftdaten'),
                                        value: partner.link || '',
                                        onChange: function(value) {
                                            updatePartner(index, 'link', value);
                                        },
                                        help: __('Optional: Link to partner website', 'luftdaten'),
                                        type: 'url'
                                    }),
                                    el(Button, {
                                        isDestructive: true,
                                        isSmall: true,
                                        onClick: function() {
                                            if (confirm(__('Are you sure you want to remove this partner?', 'luftdaten'))) {
                                                removePartner(index);
                                            }
                                        },
                                        style: { marginTop: '10px' }
                                    }, __('Remove Partner', 'luftdaten'))
                                );
                            }),
                            el(Button, {
                                isPrimary: true,
                                isSmall: true,
                                onClick: addPartner,
                                style: { marginTop: '10px' }
                            }, __('Add Partner', 'luftdaten'))
                        )
                    )
                ),
                el('div', { className: 'luftdaten-partner-logos-preview' },
                    el('h3', {}, attributes.title || __('Unsere Partner', 'luftdaten')),
                    attributes.partners.length > 0 ? el('div', { className: 'partners-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '30px', marginTop: '20px', alignItems: 'center' } },
                        attributes.partners.map(function(partner, index) {
                            var logoElement = partner.logoUrl ? 
                                el('img', {
                                    src: partner.logoUrl,
                                    alt: partner.name || __('Partner Logo', 'luftdaten'),
                                    style: { maxWidth: '100%', height: 'auto', opacity: 0.7 }
                                }) :
                                el('div', { style: { padding: '20px', border: '1px dashed #ccc', textAlign: 'center', color: '#999' } }, __('No logo', 'luftdaten'));
                            
                            return partner.link && partner.link !== '' ?
                                el('a', {
                                    key: index,
                                    href: partner.link,
                                    target: '_blank',
                                    rel: 'noopener noreferrer',
                                    style: { display: 'block' }
                                }, logoElement) :
                                el('div', { key: index }, logoElement);
                        })
                    ) : el('p', { style: { color: '#666', fontStyle: 'italic' } }, __('No partner logos configured. Add partners in the block settings.', 'luftdaten'))
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
