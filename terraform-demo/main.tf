terraform {
  required_version = ">= 1.5"
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = ">= 3.5"
    }
  }
}

provider "random" {}

resource "random_pet" "example" {
  length = 2
}
