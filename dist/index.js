'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const cookie_parser_1 = __importDefault(require('cookie-parser'));
const dotenv_1 = __importDefault(require('dotenv'));
dotenv_1.default.config({ path: '.env' });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.send('server');
    console.log('someone came');
});
app.listen(process.env.PORT, () => {
    console.log('listening:' + `${process.env.PORT}`);
});
