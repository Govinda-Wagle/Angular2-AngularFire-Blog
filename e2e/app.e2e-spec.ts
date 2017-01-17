import { GwPage } from './app.po';

describe('gw App', function() {
  let page: GwPage;

  beforeEach(() => {
    page = new GwPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
