import { FilterPipe } from './filter.pipe';

describe('FilterPipe', () => {
  it('should filter', () => {
    const pipe = new FilterPipe();
    const mockData = [{ name: 'react' }, { name: 'angular' }, { name: 'vue' }];
    expect(pipe.transform(mockData, 'angular')).toEqual([{ name: 'angular' }]);
  });
});
