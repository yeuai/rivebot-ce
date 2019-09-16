import { expect } from 'chai';
import axios from 'axios';

describe('NLU API', () => {

  describe('chat', () => {
    it('init conversation', async () => {
      const res = await axios.post('http://localhost:3000/api/nlu/chat/init_conversation', {
        context: {},
        currentNode: '',
        extractedParameters: {},
        fromBot: false,
        input: 'init_conversation',
        intent: {},
        speechResponse: '',
        to: 'rivebot@yeu.ai',
      });

      expect(res.status).to.equal(200);
      expect(res.data.input).to.be.eq('init_conversation');
      expect(res.data.speechResponse).to.be.match(/^xin chào/i, 'greeting response from bot!');
      expect(res.data.complete).to.be.eq(true);
    });
  });
});
