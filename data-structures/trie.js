class Node {
    constructor() {
        this.chars = new Map();
        this.end = false;
    }
    setEnd() {
        this.end = !this.end;
    }

    isEnd() {
        return this.end;
    }
}

class Trie {
    constructor() {
        this.root = new Node();
    }

    add(word) {
        // if not a string 
        if (typeof word !== 'string') return null;

        // start from root
        let node = this.root
        // loop until no more letters in word
        while (word.length > 0) {
            // if letter doesn't exists in Node, create new letter pointing to new Map (e.g. f => {})
            if (!node.chars.get(word[0])) node.chars.set(word[0], new Node);
            // set current Node to letter 
            node = node.chars.get(word[0]);
            // remove first character in strin
            word = word.substring(1);
        }
        // mark final letter as end of word
        if (!node.isEnd()) node.setEnd();
    }

    exists(word) {
        // if not a string 
        if (typeof word !== 'string') return null;

        // start from root
        let node = this.root;
        // loop through all letters in word
        while (word.length > 0) {
            // if letter doesn't exists return false
            if (!node.chars.get(word[0])) return false;
            // if letter exists set to current letter
            node = node.chars.get(word[0]);
            // remove first character in string
            word = word.substring(1);
        }
        // if last letter is marked as ending a word return true
        return node.isEnd()
    }

    delete(word, node = this.root) {
        // if not a string 
        if (typeof word !== 'string') return null;

        // when no more letters in word
        if (word === '') {
            // if last letter is the end of a word
            if (node.isEnd()) {
                // set node.end to false
                node.setEnd();
                // return true to start backwards recursion, which deletes leaf nodes
                return true;
            }
            // if first(manual) call was with empty string
            return null;
        }

        let curNode = node.chars.get(word[0]);

        // if current letter/node doesn't exist
        if (!curNode) return null;

        // if true, delete leaf nodes
        if (this.delete(word.substring(1), curNode)) {
            // if current node doesn't have children
            if (curNode.chars.size === 0) {
                // delete current node and return true
                return node.chars.delete(word[0]);
            }
        }
    }

    printAll() {
        let arr = [];

        // go through all letters and add the words to array
        const search = function (node, string) {
            // if node is NOT a leaf node
            if (node.chars.size !== 0) {
                // if node ends a word
                if (node.isEnd()) {
                    // push word to array
                    arr.push(string);
                }
                // go through all letters node points to
                for (let letter of node.chars.keys()) {
                    // recursively go through all letters, and add current letter to string 
                    search(node.chars.get(letter), string.concat(letter));
                }
            } else {
                // if node is a leaf node
                arr.push(string);
            }
        }

        // call recursive function
        search(this.root, '');
        return arr;
    }
}

let trie = new Trie;
trie.add('was');
trie.add('were');
trie.add('three');
trie.add('tree');
trie.add('to');
trie.add('toga');
trie.add('together');

trie.exists('three');
trie.exists('motion');

trie.delete('toga');

trie.printAll();