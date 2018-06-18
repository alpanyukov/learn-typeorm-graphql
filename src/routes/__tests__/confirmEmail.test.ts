import fetch from 'node-fetch';

it('confirm show invalid for unknown userId', async () => {
    const response = await fetch(process.env.TEST_HOST + '/confirm/123');
    const result = await response.text();
    expect(result).toBe('invalid');
});
