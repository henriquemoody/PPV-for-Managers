import PropertiesBuilder from './PropertiesBuilder';
import Page from './Page';
import Replacement from './Replacement';

class DummyPage extends Page {
    public static createWithId(): DummyPage {
        const page = new DummyPage('65EBA0DB-AAEE-4FEF-9744-5EC9F1C9DFD9', 'Page with ID');
        page.id = '90EE953D-4DD2-4FD4-A2EC-6856D06AFAC3';

        return page;
    }

    public static createWithoutId(): DummyPage {
        return new DummyPage('65EBA0DB-AAEE-4FEF-9744-5EC9F1C9DFD9', 'Page without ID');
    }

    toProperties(): object {
        return [];
    }
}

const PROPERTY_NAME = 'title_property';

test('builds a checkbox that is true', () => {
    const sut = new PropertiesBuilder();
    sut.checkbox(PROPERTY_NAME, true);

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        type: 'checkbox',
        checkbox: true,
    });
});

test('builds a checkbox that is false', () => {
    const sut = new PropertiesBuilder();
    sut.checkbox(PROPERTY_NAME, false);

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        type: 'checkbox',
        checkbox: false,
    });
});

test('builds a title', () => {
    const sut = new PropertiesBuilder();
    sut.title(PROPERTY_NAME, 'title_content');

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        title: [
            {
                text: {
                    content: 'title_content',
                },
                type: 'text',
            },
        ],
        type: 'title',
    });
});

test('builds a title keeping placeholder when there is no replacement', () => {
    const sut = new PropertiesBuilder();
    sut.title(PROPERTY_NAME, 'Title with #UnknownPlaceholder');

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        title: [
            {
                text: {
                    content: 'Title with #UnknownPlaceholder',
                },
                type: 'text',
            },
        ],
        type: 'title',
    });
});

test('builds a title keeping placeholder when Page in replacement does not have an ID', () => {
    const sut = new PropertiesBuilder();

    sut.title(PROPERTY_NAME, 'With #WillBeShown', new Replacement('WillBeShown', DummyPage.createWithoutId()));

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        title: [
            {
                text: {
                    content: 'With #WillBeShown',
                },
                type: 'text',
            },
        ],
        type: 'title',
    });
});

test('builds a title keeping placeholder when cannot find it in the replacement', () => {
    const sut = new PropertiesBuilder();

    sut.title(PROPERTY_NAME, 'With #AnotherPlaceholder', new Replacement('ThisPlaceholder', DummyPage.createWithId()));

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        title: [
            {
                text: {
                    content: 'With #AnotherPlaceholder',
                },
                type: 'text',
            },
        ],
        type: 'title',
    });
});

test('builds a title replacing placeholder', () => {
    const page = DummyPage.createWithId();

    const sut = new PropertiesBuilder();

    sut.title(PROPERTY_NAME, 'With #Placeholder', new Replacement('Placeholder', page));

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        title: [
            {
                text: {
                    content: 'With ',
                },
                type: 'text',
            },
            {
                type: 'mention',
                mention: {
                    page: {
                        id: page.id,
                    },
                    type: 'page',
                },
                plain_text: page.title,
                href: 'https://www.notion.so/' + page.id.replace(/-/g, ''),
            },
        ],
        type: 'title',
    });
});

test('builds a title with mention', () => {
    const sut = new PropertiesBuilder();

    const page_text = 'Page';
    const page_id = '6f7441d5-4a58-4cb0-9ce2-2e8051d57e3a';

    sut.title(PROPERTY_NAME, `With @[${page_text}](${page_id})`);

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        title: [
            {
                text: {
                    content: 'With ',
                },
                type: 'text',
            },
            {
                type: 'mention',
                mention: {
                    type: 'page',
                    page: {
                        id: page_id,
                    },
                },
                plain_text: page_text,
                href: 'https://www.notion.so/' + page_id.replace(/-/g, ''),
            },
        ],
        type: 'title',
    });
});

test('builds a title with link', () => {
    const sut = new PropertiesBuilder();

    const link_text = 'Link';
    const link_url = 'https://example.com/';

    sut.title(PROPERTY_NAME, `With [${link_text}](${link_url})`);

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        title: [
            {
                text: {
                    content: 'With ',
                },
                type: 'text',
            },
            {
                type: 'text',
                text: {
                    content: link_text,
                    link: {
                        url: link_url,
                    },
                },
                plain_text: link_text,
                href: link_url,
            },
        ],
        type: 'title',
    });
});

test('builds a title with placeholder, mention, and link', () => {
    const page = DummyPage.createWithId();

    const sut = new PropertiesBuilder();

    const link_text = 'Link';
    const link_url = 'https://example.com/';

    const page_text = 'Page';
    const page_id = '6f7441d5-4a58-4cb0-9ce2-2e8051d57e3a';

    sut.title(
        PROPERTY_NAME,
        `With #Placeholder, @[${page_text}](${page_id}), and [${link_text}](${link_url})!`,
        new Replacement('Placeholder', page)
    );

    expect(sut.build()).toHaveProperty(PROPERTY_NAME, {
        title: [
            {
                text: {
                    content: 'With ',
                },
                type: 'text',
            },
            {
                type: 'mention',
                mention: {
                    page: {
                        id: page.id,
                    },
                    type: 'page',
                },
                plain_text: page.title,
                href: 'https://www.notion.so/' + page.id.replace(/-/g, ''),
            },
            {
                text: {
                    content: ', ',
                },
                type: 'text',
            },
            {
                type: 'mention',
                mention: {
                    type: 'page',
                    page: {
                        id: page_id,
                    },
                },
                plain_text: page_text,
                href: 'https://www.notion.so/' + page_id.replace(/-/g, ''),
            },
            {
                text: {
                    content: ', and ',
                },
                type: 'text',
            },
            {
                type: 'text',
                text: {
                    content: link_text,
                    link: {
                        url: link_url,
                    },
                },
                plain_text: link_text,
                href: link_url,
            },
            {
                text: {
                    content: '!',
                },
                type: 'text',
            },
        ],
        type: 'title',
    });
});
