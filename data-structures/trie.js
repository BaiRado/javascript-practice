class Node {
    constructor() {
        this.chars = new Map();
        this.end = false;
    }
    setEnd() {
        this.end = true;
    }
}

class Trie {
    constructor() {
        this.root = new Node();
    }

    add(word, node = this.root) {
        while (word.length > 0) {
            if (!node.chars.get(word[0])) node.chars.set(word[0], new Node);
            node = node.chars.get(word[0])
            word = word.substring(1)
        }
        node.setEnd()
    }
}

let trie = new Trie;
trie.add('was')
trie.add('were')
trie.add('three')
trie.add('tree')
trie.add('to')
trie.add('toga')
trie.add('together')
trie