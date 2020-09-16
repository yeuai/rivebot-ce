import { Injectable } from '@kites/common';
import * as dict from '@vntk/dictionary';
import * as _ from 'lodash';
import { titleCase } from 'title-case';

/**
 * ===========================
 * token syntax
 * ===========================
 *         _ row 1
 *        /  _ row 2
 *       /  /  _ column
 *      /  /  /
 *    T[0,2][0]
 *          .is_digit
 *            \_ function
 *
 * ===========================
 * sample tagged sentence
 * ===========================
 * this     A
 * is       B
 * a        C
 * sample   D
 * sentence E
 */
@Injectable()
class WordFeatures {

  get functions() {
    return {
      lower: this.text_lower,
      istitle: this.text_isTitle,
      isallcap: this.text_isUpperCase,
      isdigit: this.text_isDigit,
      is_in_dict: this.text_isInDict,
    };
  }

  text_lower(word) {
    return word.toLowerCase();
  }

  text_isDigit(word) {
    return /^\d+$/.test(word);
  }

  text_isUpperCase(word) {
    return word === word.toUpperCase();
  }

  text_isTitle(word) {
    return word === titleCase(word);
  }

  text_isInDict(word) {
    return dict.has(word);
  }

  apply_template(name, word) {
    // console.log('apply_template', name, word)
    return this.functions[name](word);
  }

  toFeatures(sent: string[][], i: number, tokenSyntax: string, debug: boolean = true) {

    const columns = [];
    for (let j = 0; j < sent[0].length; j++) {
      columns[j] = []; // values
      for (const colval of sent) {
        columns[j].push(colval[j]);
      }
    }

    // console.log(columns)
    let result;
    let word;
    const match = /T\[(\-?\d+),?(\-?\d+)?\](\[(.*)\])?(\.(.*))?/.exec(tokenSyntax);

    let index1: any = match[1];
    let index2: any = match[2];
    const column = match[4] || 0;
    const func = match[6];

    const prefix = debug ? `${tokenSyntax}=` : '';
    index1 = index1 && parseInt(index1, 10);
    index2 = index2 && parseInt(index2, 10);

    if (i + index1 < 0) { return `${prefix}BOS`; }
    if (i + index1 >= sent.length) { return `${prefix}EOS`; }

    if (typeof index2 !== 'undefined') {
      if (i + index2 >= sent.length) { return `${prefix}EOS`; }
      word = columns[column].slice(i + index1, i + index2 + 1).join(' ');
    } else {
      word = sent[i + index1][column];
    }

    // apply template
    if (!func) {
      result = word;
    } else {
      result = this.apply_template(func, word);
      if (typeof result === 'boolean') {
        result = result ? 'True' : 'False';
      }
    }

    return `${prefix}${result}`;
  }

  word2features(sent: string[][], i: number, template: string[]): string[] {
    const features: string[] = [];

    template.forEach((tokenSyntax) => {
      features.push(this.toFeatures(sent, i, tokenSyntax));
    });

    return features;
  }

  /**
   * Sentence to labels
   * @param sent tokens as a sentence
   * @param index word presentation
   */
  sent2labels(sent: string[][], index: number = 3) {
    return sent.map((tokens) => tokens[index]);
  }

}

export {
  WordFeatures,
};
