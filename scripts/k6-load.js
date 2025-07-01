import http from 'k6/http';
import { sleep } from 'k6';

export const options = { vus: 20, duration: '30s' };

export default function () {
  http.get('http://localhost:4000/v1/skus');
  sleep(1);
}