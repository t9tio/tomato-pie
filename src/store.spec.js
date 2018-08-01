import store from './store';

suite('store');

test('Tomato', async () => {
    store.Tomato.add({
        tag: 'hi'
    })
});