package main

import (
	"bytes"
	"context"
	"fmt"
	"net/http"

	"golang.org/x/oauth2"
)

func postComment(token string, pr int, md string) error {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	tc := oauth2.NewClient(ctx, ts)

	body := bytes.NewBufferString(
		fmt.Sprintf(`{"body":%q}`, md))
	req, _ := http.NewRequest("POST",
		fmt.Sprintf("https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/%d/comments", pr),
		body)
	req.Header.Set("Content-Type", "application/json")
	res, err := tc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return fmt.Errorf("comment failed %d", res.StatusCode)
	}
	return nil
}
