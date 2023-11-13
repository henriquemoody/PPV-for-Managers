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
